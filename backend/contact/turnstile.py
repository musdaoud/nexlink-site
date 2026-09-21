"""Cloudflare Turnstile server-side check (only active when TURNSTILE_SECRET is set)."""
import json
import logging
import urllib.parse
import urllib.request

from django.conf import settings

log = logging.getLogger(__name__)
VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def verify(token, remote_ip=None):
    """True if the visitor passed the challenge. Explicit failures are rejected; if Cloudflare
    itself is unreachable we let the request through (and log it) rather than lose a real lead."""
    if not settings.TURNSTILE_SECRET:
        return True
    if not token:
        return False
    data = {"secret": settings.TURNSTILE_SECRET, "response": token}
    if remote_ip:
        data["remoteip"] = remote_ip
    try:
        req = urllib.request.Request(VERIFY_URL, data=urllib.parse.urlencode(data).encode(), method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return bool(json.load(resp).get("success"))
    except Exception:  # network problem on Cloudflare's side
        log.warning("Turnstile verification unavailable — request accepted without it", exc_info=True)
        return True
