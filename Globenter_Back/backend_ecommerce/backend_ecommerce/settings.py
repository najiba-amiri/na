from pathlib import Path
import os
from datetime import timedelta

# -------------------
# BASE DIRECTORIES
# -------------------
BASE_DIR = Path(__file__).resolve().parent.parent

def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if (
            len(value) >= 2
            and ((value[0] == value[-1] == '"') or (value[0] == value[-1] == "'"))
        ):
            value = value[1:-1]
        os.environ.setdefault(key, value)


_load_env_file(BASE_DIR / ".env")

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# -------------------
# SECRET & DEBUG
# -------------------
SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-secret-key')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

# -------------------
# INSTALLED APPS
# -------------------
INSTALLED_APPS = [
    # Default Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    # 'allauth.socialaccount.providers.facebook',
    'corsheaders',
    'rest_framework_simplejwt.token_blacklist',

    # Local apps
    'accounts',
    'products',
    'cart',
    'wishlist',
    'brand',
    "payments",
    'finance_acount',
]

SITE_ID = 1

# -------------------
# AUTHENTICATION
# -------------------
AUTH_USER_MODEL = 'accounts.CustomUser'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Default
    'allauth.account.auth_backends.AuthenticationBackend',  # Needed for allauth
]

ACCOUNT_SIGNUP_FIELDS = ['email*', 'username*', 'password1*', 'password2*']
ACCOUNT_LOGIN_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_UNIQUE_EMAIL = True

# Allow social login to authenticate/connect an existing account by verified email.
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True

REST_USE_JWT = True  # Important for dj-rest-auth JWT
REST_AUTH = {
    "USE_JWT": True,
    "LOGIN_SERIALIZER": "accounts.auth_serializers.EmailVerificationLoginSerializer",
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer', 'JWT'),
}

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_SECRET'),
            'key': ''
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'}
    }
}

# -------------------
# MIDDLEWARE
# -------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend_ecommerce.urls'

# -------------------
# TEMPLATES
# -------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "backend_ecommerce" / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_ecommerce.wsgi.application'

# -------------------
# DATABASE
# -------------------
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# Uncomment for PostgreSQL

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'ecommerce_db'),
        'USER': os.environ.get('DB_USER', 'amiri'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'Bano!@(2005)Amiri'),
        'HOST': os.environ.get('DB_HOST', 'db'),  # Docker container
        'PORT': int(os.environ.get('DB_PORT', 5432)),
    }
}


# -------------------
# PASSWORD VALIDATION
# -------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -------------------
# INTERNATIONALIZATION
# -------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -------------------
# REST FRAMEWORK
# -------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'register': os.environ.get('THROTTLE_REGISTER', '5/min'),
        'verify_email': os.environ.get('THROTTLE_VERIFY_EMAIL', '10/min'),
        'resend_verification': os.environ.get('THROTTLE_RESEND_VERIFICATION', '1/min'),
        'forgot_password': os.environ.get('THROTTLE_FORGOT_PASSWORD', '5/min'),
        'reset_password': os.environ.get('THROTTLE_RESET_PASSWORD', '10/min'),
        'set_password': os.environ.get('THROTTLE_SET_PASSWORD', '10/min'),
        'login': os.environ.get('THROTTLE_LOGIN', '10/min'),
    },
}

# -------------------
# CORS & CSRF
# -------------------
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Local dev
    "https://globenter.com",
    "https://www.globenter.com",
    "http://globenter.com",
    "http://www.globenter.com",
]

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

# -------------------
# SECURITY / HTTPS
# -------------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "True") == "True"
SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "True") == "True"
CSRF_COOKIE_SECURE = os.environ.get("CSRF_COOKIE_SECURE", "True") == "True"

# -------------------
# EMAIL
# -------------------
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False') == 'True'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'no-reply@globenter.com')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = int(os.environ.get('EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS', 24))
