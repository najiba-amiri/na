from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import override_settings
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import Address, EmailVerificationToken, Profile


User = get_user_model()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_URL="http://localhost:3000",
    EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS=24,
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": (
            "rest_framework_simplejwt.authentication.JWTAuthentication",
        ),
        "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
        "DEFAULT_THROTTLE_RATES": {
            "register": "5/min",
            "verify_email": "10/min",
            "resend_verification": "1/min",
            "forgot_password": "5/min",
            "reset_password": "10/min",
            "set_password": "10/min",
            "login": "10/min",
        },
    },
)
class EmailVerificationFlowTests(APITestCase):
    def test_pre_register_sends_verification_email(self):
        payload = {
            "full_name": "Pre Registered",
            "email": "preregistered@example.com",
        }
        response = self.client.post("/api/auth/pre-register/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "verification_email_sent"})
        user = User.objects.get(email="preregistered@example.com")
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())
        self.assertEqual(user.first_name, "Pre")
        self.assertEqual(user.last_name, "Registered")
        self.assertEqual(EmailVerificationToken.objects.filter(user=user).count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_register_sends_verification_email(self):
        payload = {
            "full_name": "New User",
            "email": "newuser@example.com",
            "password1": "StrongPass123!",
            "password2": "StrongPass123!",
        }
        response = self.client.post("/api/auth/register/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {"message": "verification_email_sent"})
        user = User.objects.get(email="newuser@example.com")
        self.assertFalse(user.is_active)
        self.assertEqual(user.first_name, "New")
        self.assertEqual(user.last_name, "User")
        self.assertEqual(EmailVerificationToken.objects.filter(user=user).count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_pre_register_auth_alias_accepts_full_name(self):
        payload = {
            "full_name": "Alias Tester",
            "email": "alias-pre-register@example.com",
        }
        response = self.client.post("/auth/pre-register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "verification_email_sent"})
        user = User.objects.get(email="alias-pre-register@example.com")
        self.assertEqual(user.first_name, "Alias")
        self.assertEqual(user.last_name, "Tester")

    def test_auth_alias_verify_and_set_password_flow(self):
        user = User.objects.create_user(
            username="flow-user",
            email="flow-user@example.com",
            is_active=False,
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])
        _, raw_token = EmailVerificationToken.issue_token(user)

        verify_response = self.client.post(
            "/auth/verify-email/",
            {"token": raw_token},
            format="json",
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn("signup_token", verify_response.data)

        set_password_response = self.client.post(
            "/auth/set-password/",
            {
                "signup_token": verify_response.data["signup_token"],
                "password1": "StrongPass123!",
                "password2": "StrongPass123!",
            },
            format="json",
        )
        self.assertEqual(set_password_response.status_code, status.HTTP_200_OK)
        self.assertTrue(set_password_response.data.get("access"))
        self.assertTrue(set_password_response.data.get("refresh"))

    def test_login_auth_alias_accepts_email_password(self):
        User.objects.create_user(
            username="alias-login-user",
            email="alias-login@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        response = self.client.post(
            "/auth/login/",
            {"email": "alias-login@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("access"))
        self.assertTrue(response.data.get("refresh"))

    def test_register_existing_inactive_user_resends_without_password_fields(self):
        user = User.objects.create_user(
            username="existinginactive",
            email="existinginactive@example.com",
            password="StrongPass123!",
            is_active=False,
        )
        EmailVerificationToken.issue_token(user)

        response = self.client.post(
            "/api/auth/register/",
            {"email": "existinginactive@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {"message": "verification_email_sent"})
        self.assertEqual(
            EmailVerificationToken.objects.filter(user=user, used_at__isnull=True).count(),
            1,
        )
        self.assertEqual(len(mail.outbox), 1)

    def test_register_existing_active_user_returns_400(self):
        User.objects.create_user(
            username="activeuser",
            email="active@example.com",
            password="StrongPass123!",
            is_active=True,
        )

        response = self.client.post(
            "/api/auth/register/",
            {"email": "active@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("code"), "email_exists")
        self.assertIn("email", response.data.get("field_errors", {}))

    def test_verify_activates_user(self):
        user = User.objects.create_user(
            username="verifyme",
            email="verifyme@example.com",
            password="StrongPass123!",
            is_active=False,
        )
        _, raw_token = EmailVerificationToken.issue_token(user)

        response = self.client.post(
            "/api/auth/verify-email/",
            {"token": raw_token},
            format="json",
        )

        user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "email_verified"})
        self.assertTrue(user.is_active)

    def test_verify_returns_signup_token_for_pre_registered_user(self):
        user = User.objects.create_user(
            username="needs-password",
            email="needs-password@example.com",
            is_active=False,
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])
        _, raw_token = EmailVerificationToken.issue_token(user)

        response = self.client.post(
            "/api/auth/verify-email/",
            {"token": raw_token},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("message"), "email_verified")
        self.assertIn("signup_token", response.data)
        user.refresh_from_db()
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())

    def test_set_password_activates_user(self):
        user = User.objects.create_user(
            username="set-password-user",
            email="set-password-user@example.com",
            is_active=False,
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])
        _, raw_token = EmailVerificationToken.issue_token(user)
        verify = self.client.post(
            "/api/auth/verify-email/",
            {"token": raw_token},
            format="json",
        )
        signup_token = verify.data.get("signup_token")

        response = self.client.post(
            "/api/auth/set-password/",
            {
                "signup_token": signup_token,
                "password1": "StrongPass123!",
                "password2": "StrongPass123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("message"), "password_set")
        self.assertTrue(response.data.get("access"))
        self.assertTrue(response.data.get("refresh"))
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertTrue(user.has_usable_password())

    def test_expired_token_returns_410(self):
        user = User.objects.create_user(
            username="expired",
            email="expired@example.com",
            password="StrongPass123!",
            is_active=False,
        )
        token_obj, raw_token = EmailVerificationToken.issue_token(user)
        token_obj.expires_at = timezone.now() - timedelta(minutes=1)
        token_obj.save(update_fields=["expires_at"])

        response = self.client.post(
            "/api/auth/verify-email/",
            {"token": raw_token},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_410_GONE)
        self.assertEqual(response.data, {"code": "token_expired", "message": "token_expired"})

    def test_resend_verification_rate_limit(self):
        User.objects.create_user(
            username="resend",
            email="resend@example.com",
            password="StrongPass123!",
            is_active=False,
        )
        payload = {"email": "resend@example.com"}

        first = self.client.post("/api/auth/resend-verification/", payload, format="json")
        second = self.client.post("/api/auth/resend-verification/", payload, format="json")

        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(second.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_login_blocked_before_verification(self):
        User.objects.create_user(
            username="blocked",
            email="blocked@example.com",
            password="StrongPass123!",
            is_active=False,
        )

        response = self.client.post(
            "/api/auth/login/",
            {"email": "blocked@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data.get("code"), "email_not_verified")

    def test_login_accepts_email_identifier(self):
        User.objects.create_user(
            username="email-login-user",
            email="email-login@example.com",
            password="StrongPass123!",
            is_active=True,
        )

        response = self.client.post(
            "/api/auth/login/",
            {"email": "email-login@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("access"))
        self.assertTrue(response.data.get("refresh"))
        self.assertEqual(response.data.get("user", {}).get("email"), "email-login@example.com")
        self.assertIn("id", response.data.get("user", {}))

    def test_login_rejects_non_email_identifier(self):
        User.objects.create_user(
            username="CaseUser",
            email="case@example.com",
            password="StrongPass123!",
            is_active=True,
        )

        response = self.client.post(
            "/api/auth/login/",
            {"email": "caseuser", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("code"), "validation_error")

    def test_profile_allows_jwt_authorization_header_scheme(self):
        user = User.objects.create_user(
            username="jwt-header-user",
            email="jwt-header@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": "jwt-header@example.com", "password": "StrongPass123!"},
            format="json",
        )
        token = login_response.data.get("access")
        self.assertTrue(token)

        self.client.credentials(HTTP_AUTHORIZATION=f"JWT {token}")
        profile_response = self.client.get("/api/accounts/profile/")
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data.get("username"), user.username)

    def test_forgot_password_sends_email(self):
        User.objects.create_user(
            username="forgot-user",
            email="forgot@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "forgot@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "password_reset_sent"})
        self.assertEqual(len(mail.outbox), 1)

    def test_reset_password_updates_password(self):
        user = User.objects.create_user(
            username="reset-user",
            email="reset@example.com",
            password="OldPass123!",
            is_active=True,
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "uid": uid,
                "token": token,
                "password1": "NewPass123!",
                "password2": "NewPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "password_reset_success"})
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass123!"))

    def test_login_invalid_credentials_returns_generic_error(self):
        User.objects.create_user(
            username="invalid-login-user",
            email="invalid-login@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        response = self.client.post(
            "/api/auth/login/",
            {"email": "invalid-login@example.com", "password": "WrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("code"), "invalid_credentials")
        self.assertEqual(response.data.get("message"), "Invalid email or password.")

    def test_me_requires_authentication(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data.get("code"), "not_authenticated")

    def test_me_returns_current_user(self):
        User.objects.create_user(
            username="me-user",
            email="me@example.com",
            password="StrongPass123!",
            is_active=True,
            first_name="Me",
            last_name="User",
        )
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": "me@example.com", "password": "StrongPass123!"},
            format="json",
        )
        token = login_response.data.get("access")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("user", {}).get("email"), "me@example.com")
        self.assertEqual(response.data.get("user", {}).get("full_name"), "Me User")

    def test_refresh_rotation_returns_new_refresh(self):
        User.objects.create_user(
            username="refresh-user",
            email="refresh@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": "refresh@example.com", "password": "StrongPass123!"},
            format="json",
        )
        old_refresh = login_response.data.get("refresh")

        response = self.client.post(
            "/api/auth/refresh/",
            {"refresh": old_refresh},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("access"))
        self.assertTrue(response.data.get("refresh"))
        self.assertNotEqual(response.data.get("refresh"), old_refresh)

    def test_refresh_with_invalid_token_returns_contract_error(self):
        response = self.client.post(
            "/api/auth/refresh/",
            {"refresh": "invalid.token.value"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data.get("code"), "invalid_refresh_token")

    def test_logout_blacklists_refresh_token(self):
        User.objects.create_user(
            username="logout-user",
            email="logout@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": "logout@example.com", "password": "StrongPass123!"},
            format="json",
        )
        refresh = login_response.data.get("refresh")
        response = self.client.post("/api/auth/logout/", {"refresh": refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "logout_success"})
        self.assertTrue(BlacklistedToken.objects.exists())

    def test_forgot_password_for_unknown_email_is_generic(self):
        response = self.client.post(
            "/api/auth/forgot-password/",
            {"email": "missing@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"message": "password_reset_sent"})

    def test_reset_password_invalid_token_returns_contract_error(self):
        user = User.objects.create_user(
            username="invalid-reset-user",
            email="invalid-reset@example.com",
            password="OldPass123!",
            is_active=True,
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        response = self.client.post(
            "/api/auth/reset-password/",
            {
                "uid": uid,
                "token": "invalid-token",
                "password1": "NewPass123!",
                "password2": "NewPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("code"), "invalid_or_expired_reset_token")


class ProfileDetailsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="profile-user",
            email="profile@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_get_profile_details(self):
        response = self.client.get("/api/accounts/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("email"), "profile@example.com")
        self.assertEqual(response.data.get("username"), "profile-user")
        self.assertIn("addresses", response.data)

    def test_put_profile_details_replaces_addresses(self):
        profile = Profile.objects.get(user=self.user)
        old_address = Address.objects.create(
            profile=profile,
            address_line="Old Street 1",
            city="Old City",
            country="Old Country",
            is_primary=True,
        )
        payload = {
            "first_name": "Profile",
            "last_name": "Owner",
            "phone": "123456789",
            "social_links": {"linkedin": "https://linkedin.com/in/profile-owner"},
            "addresses": [
                {
                    "id": old_address.id,
                    "address_line": "New Street 2",
                    "city": "New City",
                    "country": "New Country",
                    "is_primary": False,
                },
                {
                    "address_line": "Main Street 99",
                    "city": "Main City",
                    "country": "Main Country",
                    "is_primary": True,
                },
            ],
        }
        response = self.client.put("/api/accounts/profile/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("full_name"), "Profile Owner")
        self.assertEqual(len(response.data.get("addresses", [])), 2)
        primary_count = sum(1 for item in response.data["addresses"] if item.get("is_primary"))
        self.assertEqual(primary_count, 1)

    def test_patch_profile_rejects_multiple_primary_addresses(self):
        payload = {
            "addresses": [
                {
                    "address_line": "A",
                    "city": "X",
                    "country": "Y",
                    "is_primary": True,
                },
                {
                    "address_line": "B",
                    "city": "X",
                    "country": "Y",
                    "is_primary": True,
                },
            ]
        }
        response = self.client.patch("/api/accounts/profile/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
