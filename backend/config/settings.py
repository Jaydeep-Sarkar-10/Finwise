"""
Django settings for Finwise.

Production-ready configuration.
All secrets and environment-specific values are loaded from environment
variables. Local development uses backend/.env (gitignored).
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

import dj_database_url

# =========================
# BASE DIRECTORY
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# =========================
# GEMINI AI
# =========================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# =========================
# SECURITY
# =========================

SECRET_KEY = os.getenv("SECRET_KEY")

DEBUG = os.getenv("DEBUG", "False") == "True"

_allowed_hosts_env = os.getenv("ALLOWED_HOSTS", "")
_allowed_hosts_parsed = [h.strip() for h in _allowed_hosts_env.split(",") if h.strip()]

# Always allow the known production domain + local dev hosts
ALLOWED_HOSTS = list({
    "finwise-utv7.onrender.com",
    "localhost",
    "127.0.0.1",
    *_allowed_hosts_parsed,
})


# =========================
# APPLICATION DEFINITION
# =========================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    # WhiteNoise — must be before django.contrib.staticfiles
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",

    "users",
    "transactions",
    "analytics",
    "ai",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise — must be immediately after SecurityMiddleware
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# =========================
# DATABASE
# =========================
# On Render: DATABASE_URL is set automatically when a PostgreSQL add-on
# is attached. Locally: set DATABASE_URL in .env, or set individual
# DB_* variables.

_database_url = os.getenv("DATABASE_URL")

if _database_url:
    DATABASES = {
        "default": dj_database_url.parse(
            _database_url,
            conn_max_age=600,
            ssl_require=not DEBUG,
        )
    }
else:
    # Local development fallback using individual variables
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "finwise_db"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }


# =========================
# PASSWORD VALIDATION
# =========================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# =========================
# INTERNATIONALISATION
# =========================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =========================
# STATIC FILES (WhiteNoise)
# =========================

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


# =========================
# AUTH USER MODEL
# =========================

AUTH_USER_MODEL = "users.User"


# =========================
# DJANGO REST FRAMEWORK
# =========================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}


# =========================
# SIMPLE JWT
# =========================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
}


# =========================
# CORS
# =========================
# Production origins are loaded from the CORS_ALLOWED_ORIGINS env var
# (comma-separated). Localhost origins are always included for local dev.

_cors_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
_cors_prod = [o.strip() for o in _cors_env.split(",") if o.strip()]

CORS_ALLOWED_ORIGINS = _cors_prod + [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5175",
    # Production backend — always allow self-origin calls
    "https://finwise-utv7.onrender.com",
]


# =========================
# CSRF TRUSTED ORIGINS
# =========================
# Required when frontend and backend are on different domains.
# Set CSRF_TRUSTED_ORIGINS to comma-separated list of trusted origins
# (e.g. the Render backend URL and Vercel frontend URL).

_csrf_env = os.getenv("CSRF_TRUSTED_ORIGINS", "")
_csrf_from_env = [o.strip() for o in _csrf_env.split(",") if o.strip()]

# Always trust the known production domain regardless of env var
CSRF_TRUSTED_ORIGINS = list({
    "https://finwise-utv7.onrender.com",
    *_csrf_from_env,
})


# =========================
# PRODUCTION SECURITY SETTINGS
# =========================
# These are only applied when DEBUG=False (i.e. production).
# Render terminates TLS at the load balancer and forwards requests via
# HTTP internally, so SECURE_PROXY_SSL_HEADER is required.
#
# HSTS note: SECURE_HSTS_SECONDS is set conservatively at 3600 (1 hour)
# for initial deployment. Once the deployment is confirmed stable on HTTPS,
# raise this to 31536000 (1 year) and optionally add
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True.
# Do NOT enable SECURE_HSTS_PRELOAD until you are ready to submit the domain
# to the HSTS preload list — this is a permanent, hard-to-reverse commitment.

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 3600
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"