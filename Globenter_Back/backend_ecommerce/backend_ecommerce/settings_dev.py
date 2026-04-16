# from .settings import *

# DEBUG = True

# # Allow localhost and your dev IPs
# ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# # CORS for local frontend
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
# ]

# CSRF_TRUSTED_ORIGINS = [
#     "http://localhost:3000",
# ]

# # Disable HTTPS-only flags for dev
# SECURE_SSL_REDIRECT = False
# SESSION_COOKIE_SECURE = False
# CSRF_COOKIE_SECURE = False

# # -----------------------------
# # Media files (Development)
# # -----------------------------
# MEDIA_URL = "/images/"
# MEDIA_ROOT = BASE_DIR / "images"  # folder to store your product images
# AUTH_USER_MODEL = 'accounts.CustomUser'

# # In development, default to console mail unless SMTP is configured in env.
# EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
# EMAIL_HOST = os.environ.get("EMAIL_HOST", EMAIL_HOST)
# EMAIL_PORT = int(os.environ.get("EMAIL_PORT", EMAIL_PORT))
# EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", EMAIL_HOST_USER)
# EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", EMAIL_HOST_PASSWORD)
# EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", str(EMAIL_USE_TLS)) == "True"
# EMAIL_USE_SSL = os.environ.get("EMAIL_USE_SSL", str(EMAIL_USE_SSL)) == "True"
# DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", DEFAULT_FROM_EMAIL)
# FRONTEND_URL = "http://localhost:3000"
