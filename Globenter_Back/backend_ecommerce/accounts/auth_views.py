import logging
from smtplib import SMTPException

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.db import transaction
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework import exceptions as drf_exceptions

from .auth_serializers import (
    EmailLoginSerializer,
    ForgotPasswordSerializer,
    LogoutRequestSerializer,
    PreRegisterSerializer,
    RegisterRequestSerializer,
    ResetPasswordSerializer,
    ResendVerificationSerializer,
    SetPasswordSerializer,
    TokenRefreshRequestSerializer,
    VerifyEmailSerializer,
)
from .email_verification import send_verification_email
from .models import EmailVerificationToken
from .password_reset import send_password_reset_email


User = get_user_model()
logger = logging.getLogger(__name__)
SIGNUP_TOKEN_SALT = "accounts.set_password"
SIGNUP_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24


def _auth_error_response(
    *,
    code: str,
    message: str,
    status_code: int,
    field_errors=None,
):
    payload = {"code": code, "message": message}
    if field_errors:
        payload["field_errors"] = field_errors
    return Response(payload, status=status_code)


def _serialize_user_payload(user):
    role = None
    profile_image = None
    full_name = (f"{user.first_name} {user.last_name}").strip()
    profile = getattr(user, "profile", None)
    if profile:
        role = profile.role
        if profile.profile_image:
            profile_image = profile.profile_image.url
        if not full_name:
            full_name = f"{profile.first_name or ''} {profile.last_name or ''}".strip()

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": full_name,
        "role": role,
        "profile_image": profile_image,
        "is_active": user.is_active,
    }


class AuthAPIView(APIView):
    def handle_exception(self, exc):
        if isinstance(exc, drf_exceptions.ValidationError):
            detail = exc.detail
            if isinstance(detail, dict):
                return _auth_error_response(
                    code="validation_error",
                    message="Validation failed.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    field_errors=detail,
                )
            return _auth_error_response(
                code="validation_error",
                message="Validation failed.",
                status_code=status.HTTP_400_BAD_REQUEST,
                field_errors={"non_field_errors": detail},
            )

        if isinstance(exc, drf_exceptions.Throttled):
            return _auth_error_response(
                code="rate_limited",
                message="Too many requests. Please try again later.",
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        if isinstance(exc, drf_exceptions.NotAuthenticated):
            return _auth_error_response(
                code="not_authenticated",
                message="Authentication credentials were not provided.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        if isinstance(exc, drf_exceptions.PermissionDenied):
            return _auth_error_response(
                code="permission_denied",
                message="You do not have permission to perform this action.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        return super().handle_exception(exc)


def _send_verification_or_error(user, raw_token):
    try:
        send_verification_email(user=user, raw_token=raw_token)
    except SMTPException:
        logger.exception("Failed to send verification email for user_id=%s", user.id)
        return Response(
            {
                "message": "email_service_unavailable",
                "detail": "Unable to send verification email right now. Please try again later.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return None


def _send_password_reset_or_error(user, uid, token):
    try:
        send_password_reset_email(user=user, uid=uid, token=token)
    except SMTPException:
        logger.exception("Failed to send password reset email for user_id=%s", user.id)
        return Response(
            {
                "message": "email_service_unavailable",
                "detail": "Unable to send password reset email right now. Please try again later.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return None


class RegisterView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        email_value = request.data.get("email")
        if isinstance(email_value, str):
            email = email_value.lower().strip()
            existing_user = User.objects.filter(email__iexact=email).first()
            if existing_user is not None:
                if existing_user.is_active:
                    return Response(
                        {
                            "code": "email_exists",
                            "message": "An account with this email already exists. Please log in.",
                            "field_errors": {
                                "email": ["An account with this email already exists. Please log in."]
                            },
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                EmailVerificationToken.objects.filter(
                    user=existing_user, used_at__isnull=True
                ).update(used_at=timezone.now())
                _, raw_token = EmailVerificationToken.issue_token(existing_user)
                error_response = _send_verification_or_error(existing_user, raw_token)
                if error_response is not None:
                    return error_response
                logger.info(
                    "Verification email re-sent during register for user_id=%s",
                    existing_user.id,
                )
                return Response(
                    {"message": "verification_email_sent"}, status=status.HTTP_201_CREATED
                )

        serializer = RegisterRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if not user.is_active:
            EmailVerificationToken.objects.filter(
                user=user, used_at__isnull=True
            ).update(used_at=timezone.now())
            _, raw_token = EmailVerificationToken.issue_token(user)
            error_response = _send_verification_or_error(user, raw_token)
            if error_response is not None:
                return error_response
            logger.info("Verification email sent during register for user_id=%s", user.id)

        return Response({"message": "verification_email_sent"}, status=status.HTTP_201_CREATED)


class PreRegisterView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request):
        email_value = request.data.get("email")
        if isinstance(email_value, str):
            email = email_value.lower().strip()
            existing_user = User.objects.filter(email__iexact=email).first()
            if existing_user is not None:
                if existing_user.is_active:
                    return Response(
                        {
                            "code": "email_exists",
                            "message": "An account with this email already exists. Please log in.",
                            "field_errors": {
                                "email": ["An account with this email already exists. Please log in."]
                            },
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                EmailVerificationToken.objects.filter(
                    user=existing_user, used_at__isnull=True
                ).update(used_at=timezone.now())
                _, raw_token = EmailVerificationToken.issue_token(existing_user)
                error_response = _send_verification_or_error(existing_user, raw_token)
                if error_response is not None:
                    return error_response
                logger.info(
                    "Verification email re-sent during pre-register for user_id=%s",
                    existing_user.id,
                )
                return Response(
                    {"message": "verification_email_sent"}, status=status.HTTP_200_OK
                )

        serializer = PreRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(
            username=serializer.validated_data["resolved_username"],
            email=serializer.validated_data["email"],
            is_active=False,
            first_name=serializer.validated_data["resolved_first_name"],
            last_name=serializer.validated_data["resolved_last_name"],
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])

        _, raw_token = EmailVerificationToken.issue_token(user)
        error_response = _send_verification_or_error(user, raw_token)
        if error_response is not None:
            return error_response
        logger.info("Verification email sent during pre-register for user_id=%s", user.id)
        return Response({"message": "verification_email_sent"}, status=status.HTTP_200_OK)


class VerifyEmailView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "verify_email"

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_token = serializer.validated_data["token"]
        token_hash = EmailVerificationToken.hash_token(raw_token)

        token_obj = (
            EmailVerificationToken.objects.select_related("user")
            .filter(token_hash=token_hash, used_at__isnull=True)
            .first()
        )

        if token_obj is None:
            return Response(
                {"code": "invalid_or_used_token", "message": "invalid_or_used_token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if token_obj.is_expired():
            token_obj.mark_used()
            logger.info("Expired verification token used for user_id=%s", token_obj.user_id)
            return Response(
                {"code": "token_expired", "message": "token_expired"},
                status=status.HTTP_410_GONE,
            )

        with transaction.atomic():
            user = token_obj.user
            token_obj.mark_used()
            EmailVerificationToken.objects.filter(
                user=user, used_at__isnull=True
            ).exclude(id=token_obj.id).update(used_at=timezone.now())

            if user.has_usable_password():
                if not user.is_active:
                    user.is_active = True
                    user.save(update_fields=["is_active"])
                logger.info("Email verified for user_id=%s", token_obj.user_id)
                return Response({"message": "email_verified"}, status=status.HTTP_200_OK)

            payload = {"user_id": user.id, "purpose": "set_password"}
            signup_token = signing.dumps(payload, salt=SIGNUP_TOKEN_SALT)
            logger.info(
                "Email verified and signup token issued for user_id=%s", token_obj.user_id
            )
            return Response(
                {"message": "email_verified", "signup_token": signup_token},
                status=status.HTTP_200_OK,
            )


class ResendVerificationView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "resend_verification"

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response({"message": "verification_resent"}, status=status.HTTP_200_OK)

        if user.is_active:
            return Response({"message": "already_verified"}, status=status.HTTP_200_OK)

        EmailVerificationToken.objects.filter(user=user, used_at__isnull=True).update(
            used_at=timezone.now()
        )
        _, raw_token = EmailVerificationToken.issue_token(user)
        error_response = _send_verification_or_error(user, raw_token)
        if error_response is not None:
            return error_response

        logger.info("Verification email resent for user_id=%s", user.id)
        return Response({"message": "verification_resent"}, status=status.HTTP_200_OK)


class ForgotPasswordView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "forgot_password"

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            return Response({"message": "password_reset_sent"}, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        error_response = _send_password_reset_or_error(user, uid, token)
        if error_response is not None:
            return error_response

        logger.info("Password reset email sent for user_id=%s", user.id)
        return Response({"message": "password_reset_sent"}, status=status.HTTP_200_OK)


class ResetPasswordView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "reset_password"

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.filter(pk=user_id).first()
        except (TypeError, ValueError, OverflowError):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            return Response(
                {
                    "code": "invalid_or_expired_reset_token",
                    "message": "invalid_or_expired_reset_token",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["password1"])
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=["password", "is_active"])
        else:
            user.save(update_fields=["password"])

        logger.info("Password reset successful for user_id=%s", user.id)
        return Response({"message": "password_reset_success"}, status=status.HTTP_200_OK)


class SetPasswordView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "set_password"

    def post(self, request):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        signup_token = serializer.validated_data["signup_token"]
        try:
            payload = signing.loads(
                signup_token,
                salt=SIGNUP_TOKEN_SALT,
                max_age=SIGNUP_TOKEN_MAX_AGE_SECONDS,
            )
        except signing.SignatureExpired:
            return _auth_error_response(
                code="invalid_or_expired_signup_token",
                message="Invalid or expired signup token.",
                status_code=status.HTTP_400_BAD_REQUEST,
                field_errors={"signup_token": ["Invalid or expired signup token."]},
            )
        except signing.BadSignature:
            return _auth_error_response(
                code="invalid_or_expired_signup_token",
                message="Invalid or expired signup token.",
                status_code=status.HTTP_400_BAD_REQUEST,
                field_errors={"signup_token": ["Invalid or expired signup token."]},
            )

        if payload.get("purpose") != "set_password":
            return _auth_error_response(
                code="invalid_or_expired_signup_token",
                message="Invalid or expired signup token.",
                status_code=status.HTTP_400_BAD_REQUEST,
                field_errors={"signup_token": ["Invalid or expired signup token."]},
            )

        user_id = payload.get("user_id")
        user = User.objects.filter(id=user_id).first()
        if user is None:
            return _auth_error_response(
                code="invalid_or_expired_signup_token",
                message="Invalid or expired signup token.",
                status_code=status.HTTP_400_BAD_REQUEST,
                field_errors={"signup_token": ["Invalid or expired signup token."]},
            )

        user.set_password(serializer.validated_data["password1"])
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=["password", "is_active"])
        else:
            user.save(update_fields=["password"])

        refresh = RefreshToken.for_user(user)
        logger.info("Password set during signup for user_id=%s", user.id)
        return Response(
            {
                "message": "password_set",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": _serialize_user_payload(user),
            },
            status=status.HTTP_200_OK,
        )


class GuardedLoginView(AuthAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(email__iexact=email).first()
        if user is None or not user.check_password(password):
            return _auth_error_response(
                code="invalid_credentials",
                message="Invalid email or password.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return _auth_error_response(
                code="email_not_verified",
                message="Email verification is required before login.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response(
            {
                "access": access,
                "refresh": refresh_token,
                "user": _serialize_user_payload(user),
            },
            status=status.HTTP_200_OK,
        )


class RefreshTokenView(AuthAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TokenRefreshRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_serializer = TokenRefreshSerializer(data={"refresh": serializer.validated_data["refresh"]})
        try:
            token_serializer.is_valid(raise_exception=True)
        except (drf_exceptions.ValidationError, TokenError):
            return _auth_error_response(
                code="invalid_refresh_token",
                message="Refresh token is invalid or expired.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        response_payload = {"access": token_serializer.validated_data["access"]}
        if "refresh" in token_serializer.validated_data:
            response_payload["refresh"] = token_serializer.validated_data["refresh"]
        return Response(response_payload, status=status.HTTP_200_OK)


class LogoutView(AuthAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LogoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except TokenError:
            return _auth_error_response(
                code="invalid_refresh_token",
                message="Refresh token is invalid or expired.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        return Response({"message": "logout_success"}, status=status.HTTP_200_OK)


class MeView(AuthAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({"user": _serialize_user_payload(request.user)}, status=status.HTTP_200_OK)
