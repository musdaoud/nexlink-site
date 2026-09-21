"""Emails sent after a request is saved. A failure never loses the request: it is already in
the database, the error is logged and the admin shows which emails went out."""
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone

log = logging.getLogger(__name__)

CONFIRM_SUBJECT = {
    "fr": "Votre demande a bien été reçue — HyperLink",
    "en": "We’ve received your request — HyperLink",
}


def admin_url(obj):
    return settings.SITE_ADMIN_BASE_URL + reverse("admin:contact_contactrequest_change", args=[obj.pk])


def _context(obj):
    return {
        "r": obj,
        "need": obj.get_need_display(),
        "wilaya": obj.get_wilaya_display() if obj.wilaya else "",
        "admin_url": admin_url(obj),
    }


def send_notification(obj):
    """New request → HyperLink's inbox (reply goes straight to the visitor)."""
    if not settings.CONTACT_NOTIFY_TO:
        log.warning("CONTACT_NOTIFY_TO is empty — no notification sent for request %s", obj.pk)
        return False
    ctx = _context(obj)
    subject = f"[HyperLink] Nouvelle demande — {ctx['need']} — {obj.name}"
    mail = EmailMultiAlternatives(
        subject=subject,
        body=render_to_string("contact/emails/notify.txt", ctx),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=settings.CONTACT_NOTIFY_TO,
        reply_to=[obj.email] if obj.email else None,
    )
    mail.attach_alternative(render_to_string("contact/emails/notify.html", ctx), "text/html")
    if obj.attachment and settings.CONTACT_ATTACH_FILES:
        with obj.attachment.open("rb") as fh:
            mail.attach(obj.attachment_name or obj.attachment.name, fh.read())
    try:
        mail.send()
    except Exception:
        log.exception("Notification email failed for request %s", obj.pk)
        return False
    obj.notified_at = timezone.now()
    obj.save(update_fields=["notified_at"])
    return True


def send_confirmation(obj):
    """Acknowledgement to the visitor, in the language they used on the site."""
    if not obj.email:
        return False
    ctx = _context(obj)
    lang = obj.lang if obj.lang in CONFIRM_SUBJECT else "fr"
    reply_to = settings.CONTACT_REPLY_TO or (settings.CONTACT_NOTIFY_TO[0] if settings.CONTACT_NOTIFY_TO else None)
    mail = EmailMultiAlternatives(
        subject=CONFIRM_SUBJECT[lang],
        body=render_to_string(f"contact/emails/confirm_{lang}.txt", ctx),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[obj.email],
        reply_to=[reply_to] if reply_to else None,
    )
    mail.attach_alternative(render_to_string(f"contact/emails/confirm_{lang}.html", ctx), "text/html")
    try:
        mail.send()
    except Exception:
        log.exception("Confirmation email failed for request %s", obj.pk)
        return False
    obj.confirmation_sent_at = timezone.now()
    obj.save(update_fields=["confirmation_sent_at"])
    return True
