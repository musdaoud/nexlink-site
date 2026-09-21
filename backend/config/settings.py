"""
HyperLink backend — settings.

Everything environment-specific comes from environment variables (see .env.example),
so the same code runs in development (Docker + Mailpit) and in production.
"""
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def env(key, default=None):
    return os.environ.get(key, default)


def env_bool(key, default=False):
    value = os.environ.get(key)
    return default if value is None else value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(key, default=""):
    return [item.strip() for item in os.environ.get(key, default).split(",") if item.strip()]


# --------------------------------------------------------------------------- core
DEBUG = env_bool("DJANGO_DEBUG", False)
SECRET_KEY = env("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is off.")
    SECRET_KEY = "dev-only-insecure-key-change-me"

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_otp",
    "django_otp.plugins.otp_totp",
    "corsheaders",
    "contact",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django_otp.middleware.OTPMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

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

# --------------------------------------------------------------------------- database
if env("DATABASE_ENGINE", "postgres") == "sqlite":  # quick local runs only
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("POSTGRES_DB", "hyperlink"),
            "USER": env("POSTGRES_USER", "hyperlink"),
            "PASSWORD": env("POSTGRES_PASSWORD", ""),
            "HOST": env("POSTGRES_HOST", "db"),
            "PORT": env("POSTGRES_PORT", "5432"),
            "CONN_MAX_AGE": 60,
        }
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Shared cache (database) so the rate limit counts across all Gunicorn workers.
CACHES = {"default": {"BACKEND": "django.core.cache.backends.db.DatabaseCache", "LOCATION": "django_cache"}}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------------------------------- i18n
LANGUAGE_CODE = "fr"
TIME_ZONE = "Africa/Algiers"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------- files
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

# Attachments are PRIVATE: stored outside any public URL and only downloadable
# through the admin by logged-in staff. Never expose this folder in the web server.
PRIVATE_MEDIA_ROOT = Path(env("PRIVATE_MEDIA_ROOT", str(BASE_DIR / "private_media")))

# --------------------------------------------------------------------------- email (SMTP)
EMAIL_BACKEND = env("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", "localhost")
EMAIL_PORT = int(env("EMAIL_PORT", "25"))
EMAIL_HOST_USER = env("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", False)
EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", False)
EMAIL_TIMEOUT = int(env("EMAIL_TIMEOUT", "15"))
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "HyperLink <no-reply@localhost>")
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# --------------------------------------------------------------------------- contact form
CONTACT_NOTIFY_TO = env_list("CONTACT_NOTIFY_TO")          # who receives new requests
CONTACT_REPLY_TO = env("CONTACT_REPLY_TO", "")             # reply address shown to visitors
CONTACT_ATTACH_FILES = env_bool("CONTACT_ATTACH_FILES", True)
CONTACT_RETENTION_DAYS = int(env("CONTACT_RETENTION_DAYS", "365"))
CONTACT_RATE = env("CONTACT_RATE", "5/10m")                # per IP
CONTACT_MAX_UPLOAD_MB = int(env("CONTACT_MAX_UPLOAD_MB", "10"))
SITE_ADMIN_BASE_URL = env("SITE_ADMIN_BASE_URL", "http://localhost:8010").rstrip("/")
TURNSTILE_SECRET = env("TURNSTILE_SECRET", "")

# Requests above this are rejected before parsing (file + form fields).
DATA_UPLOAD_MAX_MEMORY_SIZE = 3 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 3 * 1024 * 1024

# --------------------------------------------------------------------------- admin
ADMIN_URL = env("ADMIN_URL", "gestion/")
if not ADMIN_URL.endswith("/"):
    ADMIN_URL += "/"
ADMIN_REQUIRE_2FA = env_bool("ADMIN_REQUIRE_2FA", not DEBUG)
OTP_TOTP_ISSUER = "HyperLink"

# --------------------------------------------------------------------------- CORS (static site → API)
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:8765,http://127.0.0.1:8765")
CORS_URLS_REGEX = r"^/api/.*$"
CORS_ALLOW_METHODS = ["POST", "OPTIONS"]

# Behind a reverse proxy (Caddy), the client IP is in X-Forwarded-For.
RATELIMIT_IP_META_KEY = env("RATELIMIT_IP_META_KEY") or None

# --------------------------------------------------------------------------- security (production)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(env("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_AGE = 60 * 60 * 8  # admin sessions expire after a working day

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": env("LOG_LEVEL", "INFO")},
}
