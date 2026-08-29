import os
import json

import firebase_admin
from firebase_admin import credentials


# =========================
# FIREBASE ADMIN INITIALIZATION
# =========================
# Two supported modes:
#
# 1. ENVIRONMENT VARIABLES (production on Render):
#    Set the following env vars on Render:
#      FIREBASE_TYPE, FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY_ID,
#      FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID,
#      FIREBASE_AUTH_URI, FIREBASE_TOKEN_URI,
#      FIREBASE_AUTH_PROVIDER_X509_CERT_URL, FIREBASE_CLIENT_X509_CERT_URL
#
#    IMPORTANT: FIREBASE_PRIVATE_KEY must have literal \n sequences
#    (i.e. the string "-----BEGIN PRIVATE KEY-----\nMII...").
#    Render env vars store them as escaped \\n; this code converts them.
#
# 2. SERVICE ACCOUNT JSON FILE (local development):
#    Place firebase-service-account.json in the backend/ directory.
#    This file is gitignored and must never be committed.


def _build_credentials_from_env():
    """Build Firebase credentials from environment variables."""
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")

    # Render (and most platforms) store newlines as the literal string \n
    # inside the env var value. We need to convert them to actual newlines.
    private_key = private_key.replace("\\n", "\n")

    service_account_info = {
        "type": os.getenv("FIREBASE_TYPE", "service_account"),
        "project_id": os.getenv("FIREBASE_PROJECT_ID", ""),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
        "private_key": private_key,
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL", ""),
        "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
        "auth_uri": os.getenv(
            "FIREBASE_AUTH_URI",
            "https://accounts.google.com/o/oauth2/auth",
        ),
        "token_uri": os.getenv(
            "FIREBASE_TOKEN_URI",
            "https://oauth2.googleapis.com/token",
        ),
        "auth_provider_x509_cert_url": os.getenv(
            "FIREBASE_AUTH_PROVIDER_X509_CERT_URL",
            "https://www.googleapis.com/oauth2/v1/certs",
        ),
        "client_x509_cert_url": os.getenv(
            "FIREBASE_CLIENT_X509_CERT_URL", ""
        ),
        "universe_domain": "googleapis.com",
    }

    return credentials.Certificate(service_account_info)


if not firebase_admin._apps:

    # Try env-var mode first (production)
    if os.getenv("FIREBASE_PRIVATE_KEY"):
        cred = _build_credentials_from_env()

    else:
        # Fallback: load from JSON file (local development)
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        SERVICE_ACCOUNT_PATH = os.path.join(
            BASE_DIR, "firebase-service-account.json"
        )
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)

    firebase_admin.initialize_app(cred)