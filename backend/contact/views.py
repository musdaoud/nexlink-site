import logging

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django_ratelimit.decorators import ratelimit

from . import emails, turnstile
from .forms import ContactRequestForm
from .messages import msg

log = logging.getLogger(__name__)

# fallback code per field when Django itself raised the error (tampered values etc.)
FIELD_DEFAULT_CODE = {
    "name": "form.errName",
    "phone": "form.errPhone",
    "email": "form.errEmail",
    "consent": "form.errConsent",
    "attachment": "form.errFile",
}


def _lang(request):
    lang = (request.POST.get("lang") or "").lower()
    return lang if lang in ("fr", "en") else "fr"


def _error(status, code, lang, **extra):
    return JsonResponse({"ok": False, "error": code, "message": msg(lang, code), **extra}, status=status)


def _client_ip(request):
    key = settings.RATELIMIT_IP_META_KEY or "REMOTE_ADDR"
    return (request.META.get(key) or "").split(",")[0].strip() or None


@csrf_exempt  # cross-site JSON API without cookies; protected by origin check, anti-spam and rate limit
@require_POST
@ratelimit(key="ip", rate=lambda group, request: settings.CONTACT_RATE, method="POST", block=False)
def contact_create(request):
    # only the website may post here (browsers always send Origin on cross-site requests)
    origin = request.headers.get("Origin")
    if origin and origin not in settings.CORS_ALLOWED_ORIGINS:
        return JsonResponse({"ok": False, "error": "origin"}, status=403)

    # the language is needed for the messages below, but reading POST parses the body:
    # check the declared size first so an oversized upload is refused before that
    max_bytes = (settings.CONTACT_MAX_UPLOAD_MB + 1) * 1024 * 1024
    if int(request.META.get("CONTENT_LENGTH") or 0) > max_bytes:
        return _error(413, "form.errTooLarge", "fr")

    lang = _lang(request)

    if getattr(request, "limited", False):
        return _error(429, "form.errRate", lang)

    # honeypot filled → a bot: answer "ok" so it doesn't retry, but keep nothing
    if request.POST.get("website"):
        return JsonResponse({"ok": True}, status=200)

    if not turnstile.verify(request.POST.get("cf-turnstile-response"), _client_ip(request)):
        return _error(400, "form.errCaptcha", lang)

    form = ContactRequestForm(request.POST, request.FILES, lang=lang)
    if not form.is_valid():
        errors = {}
        for field, errs in form.errors.as_data().items():
            err = errs[0]
            code = err.code if (err.code or "").startswith("form.") else FIELD_DEFAULT_CODE.get(field, "form.errInvalid")
            errors[field] = {"code": code, "message": msg(lang, code)}
        return JsonResponse({"ok": False, "error": "validation", "errors": errors}, status=400)

    obj = form.save()
    log.info("Contact request %s saved (%s)", obj.pk, obj.need)
    emails.send_notification(obj)
    emails.send_confirmation(obj)
    return JsonResponse({"ok": True, "id": obj.pk}, status=201)
