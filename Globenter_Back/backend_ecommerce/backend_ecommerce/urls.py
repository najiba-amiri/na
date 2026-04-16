from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from backend_ecommerce.views import home, health
from accounts.auth_views import (
    ForgotPasswordView,
    GuardedLoginView,
    LogoutView,
    MeView,
    PreRegisterView,
    RefreshTokenView,
    RegisterView,
    ResetPasswordView,
    ResendVerificationView,
    SetPasswordView,
    VerifyEmailView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Home page
    path('', home, name='home'),

    # Admin panel
    path("admin/", admin.site.urls),

    # Health check endpoint
    path("api/health/", health),

    # Auth endpoints
    path("auth/login/", GuardedLoginView.as_view(), name="auth_login_alias"),
    path("auth/refresh/", RefreshTokenView.as_view(), name="auth_refresh_alias"),
    path("auth/logout/", LogoutView.as_view(), name="auth_logout_alias"),
    path("auth/me/", MeView.as_view(), name="auth_me_alias"),
    path("auth/pre-register/", PreRegisterView.as_view(), name="pre_register_alias"),
    path("auth/register/", RegisterView.as_view(), name="rest_register_alias"),
    path("auth/verify-email/", VerifyEmailView.as_view(), name="verify_email_alias"),
    path("auth/resend-verification/", ResendVerificationView.as_view(), name="resend_verification_alias"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot_password_alias"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="reset_password_alias"),
    path("auth/set-password/", SetPasswordView.as_view(), name="set_password_alias"),

    path("api/auth/login/", GuardedLoginView.as_view(), name="rest_login"),
    path("api/auth/refresh/", RefreshTokenView.as_view(), name="auth_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth_logout"),
    path("api/auth/me/", MeView.as_view(), name="auth_me"),
    path("api/auth/pre-register/", PreRegisterView.as_view(), name="pre_register"),
    path("api/auth/register/", RegisterView.as_view(), name="rest_register"),
    path("api/auth/verify-email/", VerifyEmailView.as_view(), name="verify_email"),
    path("api/auth/resend-verification/", ResendVerificationView.as_view(), name="resend_verification"),
    path("api/auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("api/auth/reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("api/auth/set-password/", SetPasswordView.as_view(), name="set_password"),

    # dj-rest-auth default endpoints
    path("api/auth/", include("dj_rest_auth.urls")),

    # JWT endpoints
    path("api/auth/jwt/create/", TokenObtainPairView.as_view(), name="jwt-create"),
    path("api/auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),
    path("api/auth/jwt/verify/", TokenVerifyView.as_view(), name="jwt-verify"),

    # Accounts API
    path("api/accounts/", include("accounts.urls")),

    # Products API
    path("api/", include("products.urls")),

    # Cart API
    path("api/cart/", include("cart.urls")),

    # Wishlist API
    path("api/wishlist/", include("wishlist.urls")),

    # Social authentication
    path("auth/social/", include("allauth.socialaccount.urls")),

    # ✅ Brand API (changed to mybrand)
    path("api/", include("brand.urls")), 
    path("finance/", include("finance_acount.urls")),

    
    # Hessab Pay
    # path("api/payments/", include("payments.urls")),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
