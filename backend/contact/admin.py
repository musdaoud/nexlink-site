import csv
from pathlib import Path

from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html

from .models import ContactRequest

SUBMITTED = ("name", "company", "role", "phone", "email", "wilaya", "need", "message")
TRACE = ("created_at", "lang", "page", "consent", "consent_at", "notified_at", "confirmation_sent_at")


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ("created_at", "name", "company", "need", "wilaya_short", "phone", "email", "status", "has_file")
    list_display_links = ("created_at", "name")
    list_editable = ("status",)
    list_filter = ("status", "need", "wilaya", "lang", ("created_at", admin.DateFieldListFilter))
    search_fields = ("name", "company", "role", "email", "phone", "message")
    date_hierarchy = "created_at"
    list_per_page = 50
    actions = ["mark_in_progress", "mark_done", "mark_spam", "export_csv"]
    readonly_fields = SUBMITTED + ("attachment_link",) + TRACE
    fieldsets = (
        ("Demande", {"fields": SUBMITTED + ("attachment_link",)}),
        ("Suivi", {"fields": ("status", "notes")}),
        ("Traçabilité", {"classes": ("collapse",), "fields": TRACE}),
    )

    # requests only come from the website
    def has_add_permission(self, request):
        return False

    @admin.display(description="wilaya", ordering="wilaya")
    def wilaya_short(self, obj):
        return obj.get_wilaya_display() if obj.wilaya else "—"

    @admin.display(description="pièce jointe", boolean=True)
    def has_file(self, obj):
        return bool(obj.attachment)

    @admin.display(description="pièce jointe")
    def attachment_link(self, obj):
        if not obj.attachment:
            return "—"
        url = reverse("admin:contact_contactrequest_attachment", args=[obj.pk])
        return format_html('<a href="{}">⬇ {}</a>', url, obj.attachment_name or Path(obj.attachment.name).name)

    # --- protected attachment download (staff only, never a public URL)
    def get_urls(self):
        extra = [
            path(
                "<int:pk>/attachment/",
                self.admin_site.admin_view(self.download_attachment),
                name="contact_contactrequest_attachment",
            ),
        ]
        return extra + super().get_urls()

    def download_attachment(self, request, pk):
        obj = get_object_or_404(ContactRequest, pk=pk)
        if not self.has_view_permission(request, obj):
            raise PermissionDenied
        if not obj.attachment:
            raise Http404
        name = obj.attachment_name or Path(obj.attachment.name).name
        return FileResponse(obj.attachment.open("rb"), as_attachment=True, filename=name)

    # --- bulk actions
    def _set_status(self, request, queryset, status, label):
        count = queryset.update(status=status)
        self.message_user(request, f"{count} demande(s) marquée(s) « {label} ».", messages.SUCCESS)

    @admin.action(description="Marquer « En cours »")
    def mark_in_progress(self, request, queryset):
        self._set_status(request, queryset, ContactRequest.Status.IN_PROGRESS, "En cours")

    @admin.action(description="Marquer « Traitée »")
    def mark_done(self, request, queryset):
        self._set_status(request, queryset, ContactRequest.Status.DONE, "Traitée")

    @admin.action(description="Marquer « Indésirable »")
    def mark_spam(self, request, queryset):
        self._set_status(request, queryset, ContactRequest.Status.SPAM, "Indésirable")

    @admin.action(description="Exporter en CSV (Excel)")
    def export_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="demandes-{timezone.localdate():%Y-%m-%d}.csv"'
        response.write("﻿")  # BOM so Excel reads the accents correctly
        writer = csv.writer(response, delimiter=";")  # French Excel expects semicolons
        writer.writerow(["Date", "Nom", "Société", "Fonction", "Téléphone", "E-mail", "Wilaya",
                         "Besoin", "Message", "Pièce jointe", "Langue", "Statut", "Notes"])
        for r in queryset:
            writer.writerow([
                timezone.localtime(r.created_at).strftime("%d/%m/%Y %H:%M"), r.name, r.company, r.role, r.phone,
                r.email, r.get_wilaya_display() if r.wilaya else "", r.get_need_display(), r.message,
                r.attachment_name, r.get_lang_display(), r.get_status_display(), r.notes,
            ])
        return response
