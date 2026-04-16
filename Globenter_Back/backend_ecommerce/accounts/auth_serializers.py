from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer


User = get_user_model()


def generate_unique_username_from_email(email: str) -> str:
    local_part = email.split("@", 1)[0] or "user"
    candidate = local_part
    index = 1
    while User.objects.filter(username__iexact=candidate).exists():
        candidate = f"{local_part}{index}"
        index += 1
    return candidate


def split_full_name(full_name: str):
    normalized = (full_name or "").strip()
    if not normalized:
        return "", ""
    parts = normalized.split()
    first_name = parts[0]
    last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
    return first_name, last_name


class RegisterRequestSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False, required=False)
    confirm_password = serializers.CharField(
        write_only=True, trim_whitespace=False, required=False
    )
    password1 = serializers.CharField(write_only=True, trim_whitespace=False, required=False)
    password2 = serializers.CharField(write_only=True, trim_whitespace=False, required=False)

    def validate_username(self, value):
        normalized = value.strip()
        if User.objects.filter(username__iexact=normalized).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return normalized

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):
        password = attrs.get("password") or attrs.get("password1")
        confirm_password = attrs.get("confirm_password") or attrs.get("password2")
        if not password or not confirm_password:
            raise serializers.ValidationError(
                {"field_errors": {"password": ["Password and confirm password are required."]}}
            )
        if password != confirm_password:
            raise serializers.ValidationError({"field_errors": {"confirm_password": ["Passwords do not match."]}})
        validate_password(password)
        resolved_username = attrs.get("username", "").strip()
        if not resolved_username:
            resolved_username = generate_unique_username_from_email(attrs["email"])
        first_name, last_name = split_full_name(attrs.get("full_name", ""))
        attrs["resolved_password"] = password
        attrs["resolved_username"] = resolved_username
        attrs["resolved_first_name"] = first_name
        attrs["resolved_last_name"] = last_name
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["resolved_username"],
            email=validated_data["email"],
            password=validated_data["resolved_password"],
            is_active=False,
            first_name=validated_data["resolved_first_name"],
            last_name=validated_data["resolved_last_name"],
        )


class PreRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField()

    def validate_username(self, value):
        normalized = value.strip()
        if User.objects.filter(username__iexact=normalized).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return normalized

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, attrs):
        resolved_username = attrs.get("username", "").strip()
        if not resolved_username:
            resolved_username = generate_unique_username_from_email(attrs["email"])
        first_name, last_name = split_full_name(attrs.get("full_name", ""))
        attrs["resolved_username"] = resolved_username
        attrs["resolved_first_name"] = first_name
        attrs["resolved_last_name"] = last_name
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class SetPasswordSerializer(serializers.Serializer):
    signup_token = serializers.CharField()
    password1 = serializers.CharField(write_only=True, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        if attrs["password1"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        validate_password(attrs["password1"])
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower().strip()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password1 = serializers.CharField(write_only=True, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        if attrs["password1"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        validate_password(attrs["password1"])
        return attrs


class EmailVerificationLoginSerializer(LoginSerializer):
    """
    Preserve dj-rest-auth login behavior while returning a stable code for inactive users.
    """

    def validate(self, attrs):
        login_value = attrs.get("username") or attrs.get("email")
        password = attrs.get("password")

        if login_value and password:
            maybe_user = User.objects.filter(
                Q(username=login_value) | Q(email__iexact=login_value)
            ).first()
            if maybe_user and maybe_user.check_password(password) and not maybe_user.is_active:
                raise serializers.ValidationError(
                    {
                        "code": "email_not_verified",
                        "message": "Email verification is required before login.",
                    },
                    code="email_not_verified",
                )

        return super().validate(attrs)


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        return value.lower().strip()


class TokenRefreshRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()
