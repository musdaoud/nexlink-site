import re
from pathlib import Path

from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

from .messages import msg
from .models import ContactRequest
from .wilayas import ABROAD, WILAYA_CHOICES

# Algerian numbers: mobile 05/06/07 + 8 digits, landline 02x/03x/04x + 7 digits; +213 / 00213 / 0 prefixes
ALGERIAN_PHONE = re.compile(r"^(?:\+213|00213|0)(?:[567]\d{8}|[234]\d{7})$")
INTERNATIONAL_PHONE = re.compile(r"^\+?\d{8,15}$")

# accepted attachments, checked by extension AND by the file's real signature
FILE_SIGNATURES = {
    ".pdf": [b"%PDF-"],
    ".png": [b"\x89PNG\r\n\x1a\n"],
    ".jpg": [b"\xff\xd8\xff"],
    ".jpeg": [b"\xff\xd8\xff"],
    ".docx": [b"PK\x03\x04"],
    ".xlsx": [b"PK\x03\x04"],
    ".doc": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
    ".xls": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
}

LIMITS = {"name": 150, "company": 150, "role": 150, "message": 5000}


def normalise_phone(value):
    return re.sub(r"[\s.\-()]", "", value.replace("(0)", ""))


class ContactRequestForm(forms.ModelForm):
    """Validates a submission from the website. Error codes match the website's i18n keys."""

    consent = forms.CharField(required=False)  # checkbox sends "on"/"true" — checked in clean_consent

    class Meta:
        model = ContactRequest
        fields = ["name", "company", "role", "phone", "email", "wilaya", "need", "message", "attachment", "lang", "page"]

    def __init__(self, *args, lang="fr", **kwargs):
        super().__init__(*args, **kwargs)
        self.lang = lang if lang in ("fr", "en") else "fr"
        # every field reports errors with the website's codes and in the visitor's language
        for field in self.fields.values():
            field.required = False
            # keep Django's keys (its fields look them up), replace the texts with ours
            field.error_messages = {key: msg(self.lang, "form.errInvalid") for key in field.error_messages}
        self.fields["email"].validators = []  # validated in clean_email with our own message

    def error(self, code):
        return ValidationError(msg(self.lang, code), code=code)

    def _text(self, name):
        value = (self.cleaned_data.get(name) or "").strip()
        if len(value) > LIMITS[name]:
            raise self.error("form.errTooLong")
        return value

    def clean_name(self):
        value = self._text("name")
        if len(value) < 2:
            raise self.error("form.errName")
        return value

    def clean_company(self):
        return self._text("company")

    def clean_role(self):
        return self._text("role")

    def clean_message(self):
        return self._text("message")

    def clean_email(self):
        value = (self.data.get("email") or "").strip()
        if value:
            try:
                validate_email(value)
            except ValidationError:
                raise self.error("form.errEmail")
        return value

    def clean_wilaya(self):
        value = (self.data.get("wilaya") or "").strip()
        if value and value not in dict(WILAYA_CHOICES):
            raise self.error("form.errInvalid")
        return value

    def clean_need(self):
        value = (self.data.get("need") or "").strip()
        if value not in ContactRequest.Need.values:
            raise self.error("form.errInvalid")
        return value

    def clean_lang(self):
        return self.lang

    def clean_page(self):
        return (self.data.get("page") or "")[:500]

    def clean_consent(self):
        if (self.data.get("consent") or "").strip().lower() not in {"on", "true", "1", "yes"}:
            raise self.error("form.errConsent")
        return True

    def clean_attachment(self):
        upload = self.cleaned_data.get("attachment")
        if not upload:
            return None
        ext = Path(upload.name).suffix.lower()
        max_bytes = settings.CONTACT_MAX_UPLOAD_MB * 1024 * 1024
        if ext not in FILE_SIGNATURES or upload.size > max_bytes:
            raise self.error("form.errFile")
        head = upload.read(8)
        upload.seek(0)
        if not any(head.startswith(sig) for sig in FILE_SIGNATURES[ext]):
            raise self.error("form.errFile")  # renamed .exe, fake PDF, etc.
        return upload

    def clean(self):
        cleaned = super().clean()
        # phone depends on the wilaya: "Outside Algeria" accepts international numbers
        raw = (self.data.get("phone") or "").strip()
        phone = normalise_phone(raw)
        pattern = INTERNATIONAL_PHONE if cleaned.get("wilaya") == ABROAD else ALGERIAN_PHONE
        if not pattern.match(phone):
            self.add_error("phone", self.error("form.errPhone"))
        else:
            cleaned["phone"] = raw[:40]
        return cleaned

    def save(self, commit=True):
        from django.utils import timezone

        obj = super().save(commit=False)
        obj.phone = self.cleaned_data["phone"]
        obj.consent = True
        obj.consent_at = timezone.now()
        upload = self.cleaned_data.get("attachment")
        obj.attachment_name = Path(upload.name).name[:255] if upload else ""
        if commit:
            obj.save()
        return obj
