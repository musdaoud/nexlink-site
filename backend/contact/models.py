import os
import uuid
from pathlib import Path

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils import timezone

from .wilayas import WILAYA_CHOICES


class PrivateStorage(FileSystemStorage):
    """Attachments live outside any public URL (see PRIVATE_MEDIA_ROOT).
    The location is read from settings on every use, so it follows configuration changes."""

    @property
    def base_location(self):
        return str(settings.PRIVATE_MEDIA_ROOT)

    @property
    def location(self):
        return os.path.abspath(self.base_location)

    @property
    def base_url(self):
        return None  # no public URL, ever


def private_storage():
    return PrivateStorage()


def attachment_path(instance, filename):
    # never trust the visitor's filename on disk; the original name is kept in `attachment_name`
    return f"contact/{timezone.now():%Y/%m}/{uuid.uuid4().hex}{Path(filename).suffix.lower()}"


class ContactRequest(models.Model):
    class Need(models.TextChoices):
        INFRASTRUCTURE = "infrastructure", "Infrastructure & courant faible"
        SOFTWARE = "software", "Logiciel / ERP"
        EQUIPMENT = "equipment", "Équipements IT"
        ISO = "iso", "ISO & Consulting"
        ANPDP = "anpdp", "Conformité ANPDP"
        HVAC = "hvac", "HVAC-CVC"
        OTHER = "other", "Autre"

    class Status(models.TextChoices):
        NEW = "new", "Nouvelle"
        IN_PROGRESS = "in_progress", "En cours"
        DONE = "done", "Traitée"
        SPAM = "spam", "Indésirable"

    class Lang(models.TextChoices):
        FR = "fr", "Français"
        EN = "en", "English"

    created_at = models.DateTimeField("reçue le", auto_now_add=True, db_index=True)

    # submitted by the visitor
    name = models.CharField("nom complet", max_length=150)
    company = models.CharField("société", max_length=150, blank=True)
    role = models.CharField("fonction", max_length=150, blank=True)
    phone = models.CharField("téléphone", max_length=40)
    email = models.EmailField("e-mail", blank=True)
    wilaya = models.CharField("wilaya", max_length=10, blank=True, choices=WILAYA_CHOICES)
    need = models.CharField("type de besoin", max_length=20, choices=Need.choices)
    message = models.TextField("message", blank=True)
    attachment = models.FileField("pièce jointe", upload_to=attachment_path, storage=private_storage, blank=True)
    attachment_name = models.CharField("nom du fichier", max_length=255, blank=True)
    consent = models.BooleanField("consentement", default=False)
    consent_at = models.DateTimeField("consentement donné le", null=True, blank=True)
    lang = models.CharField("langue", max_length=2, choices=Lang.choices, default=Lang.FR)
    page = models.CharField("page d’origine", max_length=500, blank=True)

    # follow-up by the HyperLink team
    status = models.CharField("statut", max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    notes = models.TextField("notes internes", blank=True)

    # delivery tracking
    notified_at = models.DateTimeField("notification envoyée le", null=True, blank=True)
    confirmation_sent_at = models.DateTimeField("confirmation envoyée le", null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "demande de contact"
        verbose_name_plural = "demandes de contact"

    def __str__(self):
        who = f"{self.name} ({self.company})" if self.company else self.name
        return f"{who} — {self.get_need_display()}"
