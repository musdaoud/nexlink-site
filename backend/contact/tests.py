import io
import shutil
import tempfile
from datetime import timedelta
from pathlib import Path
from unittest import mock

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .models import ContactRequest

TMP_MEDIA = tempfile.mkdtemp(prefix="hl-test-media-")
ORIGIN = "http://127.0.0.1:8765"
URL = "/api/contact/"


def pdf(name="cahier.pdf", size=None):
    body = b"%PDF-1.7\n" + (b"0" * (size - 9) if size else b"test")
    return SimpleUploadedFile(name, body, content_type="application/pdf")


@override_settings(
    PRIVATE_MEDIA_ROOT=TMP_MEDIA,
    CONTACT_NOTIFY_TO=["team@example.com"],
    CONTACT_RATE="100/m",
    TURNSTILE_SECRET="",
    CORS_ALLOWED_ORIGINS=[ORIGIN],
    SITE_ADMIN_BASE_URL="https://api.example.dz",
)
class ContactApiTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP_MEDIA, ignore_errors=True)

    def post(self, origin=ORIGIN, **overrides):
        data = {
            "name": "Karim B", "company": "SARL Test", "role": "DSI", "phone": "0661 23 45 67",
            "email": "karim@example.dz", "wilaya": "16", "need": "anpdp", "message": "Bonjour",
            "consent": "on", "lang": "fr", "page": "http://127.0.0.1:8765/",
        }
        data.update(overrides)
        data = {k: v for k, v in data.items() if v is not None}
        headers = {"HTTP_ORIGIN": origin} if origin else {}
        return self.client.post(URL, data, **headers)

    # ---------------------------------------------------------------- happy path
    def test_valid_request_is_saved_and_both_emails_go_out(self):
        res = self.post()
        self.assertEqual(res.status_code, 201, res.content)
        obj = ContactRequest.objects.get(pk=res.json()["id"])
        self.assertEqual((obj.name, obj.need, obj.wilaya, obj.status), ("Karim B", "anpdp", "16", "new"))
        self.assertTrue(obj.consent and obj.consent_at)
        self.assertIsNotNone(obj.notified_at)
        self.assertIsNotNone(obj.confirmation_sent_at)

        self.assertEqual(len(mail.outbox), 2)
        notify, confirm = mail.outbox
        self.assertEqual(notify.to, ["team@example.com"])
        self.assertEqual(notify.reply_to, ["karim@example.dz"])
        self.assertIn("Conformité Loi 18-07", notify.subject)
        self.assertIn(f"https://api.example.dz/gestion/contact/contactrequest/{obj.pk}/change/", notify.body)
        self.assertEqual(confirm.to, ["karim@example.dz"])
        self.assertIn("bien été reçue", confirm.subject)

    def test_confirmation_follows_the_visitor_language(self):
        self.post(lang="en")
        self.assertIn("We’ve received", mail.outbox[1].subject)

    def test_no_email_means_no_confirmation(self):
        self.assertEqual(self.post(email="").status_code, 201)
        self.assertEqual(len(mail.outbox), 1)

    def test_attachment_is_stored_privately_and_sent_to_the_team(self):
        res = self.post(attachment=pdf())
        self.assertEqual(res.status_code, 201, res.content)
        obj = ContactRequest.objects.get()
        self.assertEqual(obj.attachment_name, "cahier.pdf")
        self.assertTrue(Path(obj.attachment.path).is_relative_to(TMP_MEDIA))
        self.assertNotIn("cahier", Path(obj.attachment.path).name)  # random name on disk
        self.assertEqual(mail.outbox[0].attachments[0][0], "cahier.pdf")

    # ---------------------------------------------------------------- validation
    def test_invalid_algerian_phone_is_rejected_in_french_and_english(self):
        res = self.post(phone="08 55 12 34 56")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["errors"]["phone"]["code"], "form.errPhone")
        self.assertIn("Numéro algérien", res.json()["errors"]["phone"]["message"])
        res = self.post(phone="12", lang="en")
        self.assertIn("Algerian number", res.json()["errors"]["phone"]["message"])
        self.assertEqual(ContactRequest.objects.count(), 0)

    def test_all_algerian_formats_are_accepted(self):
        for phone in ["05 55 12 34 56", "+213 555 12 34 56", "0021321123456", "+213 (0) 21 12 34 56", "021 12 34 56"]:
            self.assertEqual(self.post(phone=phone).status_code, 201, phone)

    def test_outside_algeria_accepts_international_numbers(self):
        self.assertEqual(self.post(wilaya="abroad", phone="+33 6 12 34 56 78").status_code, 201)

    def test_missing_name_and_consent(self):
        res = self.post(name="", consent=None)
        errors = res.json()["errors"]
        self.assertEqual(errors["name"]["code"], "form.errName")
        self.assertEqual(errors["consent"]["code"], "form.errConsent")

    def test_tampered_choice_does_not_crash(self):
        res = self.post(need="hacker", wilaya="99")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["errors"]["need"]["code"], "form.errInvalid")
        self.assertEqual(res.json()["errors"]["wilaya"]["code"], "form.errInvalid")

    def test_fake_or_forbidden_files_are_rejected(self):
        exe_as_pdf = SimpleUploadedFile("devis.pdf", b"MZ\x90\x00\x03\x00", content_type="application/pdf")
        exe = SimpleUploadedFile("setup.exe", b"MZ\x90\x00", content_type="application/octet-stream")
        for f in (exe_as_pdf, exe):
            res = self.post(attachment=f)
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.json()["errors"]["attachment"]["code"], "form.errFile")
        self.assertEqual(ContactRequest.objects.count(), 0)

    @override_settings(CONTACT_MAX_UPLOAD_MB=1)
    def test_oversized_file_is_rejected(self):
        res = self.post(attachment=pdf(size=1_200_000))
        self.assertEqual(res.json()["errors"]["attachment"]["code"], "form.errFile")

    # ---------------------------------------------------------------- abuse protection
    def test_honeypot_answers_ok_but_keeps_nothing(self):
        res = self.post(website="http://spam.example")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(ContactRequest.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_other_websites_cannot_post(self):
        self.assertEqual(self.post(origin="https://evil.example").status_code, 403)

    @override_settings(CONTACT_RATE="2/m")
    def test_rate_limit(self):
        self.post(), self.post()
        res = self.post()
        self.assertEqual(res.status_code, 429)
        self.assertEqual(res.json()["error"], "form.errRate")

    @override_settings(TURNSTILE_SECRET="secret")
    def test_turnstile_when_configured(self):
        self.assertEqual(self.post().json()["error"], "form.errCaptcha")
        with mock.patch("contact.turnstile.urllib.request.urlopen", return_value=io.BytesIO(b'{"success": true}')):
            self.assertEqual(self.post(**{"cf-turnstile-response": "token"}).status_code, 201)

    def test_email_failure_never_loses_the_request(self):
        with mock.patch("django.core.mail.EmailMultiAlternatives.send", side_effect=OSError("smtp down")):
            res = self.post()
        self.assertEqual(res.status_code, 201)
        obj = ContactRequest.objects.get()
        self.assertIsNone(obj.notified_at)


@override_settings(PRIVATE_MEDIA_ROOT=TMP_MEDIA, CONTACT_NOTIFY_TO=["team@example.com"], CORS_ALLOWED_ORIGINS=[ORIGIN])
class AdminAndMaintenanceTests(TestCase):
    def setUp(self):
        self.client.post(URL, {"name": "Amel", "phone": "0550123456", "need": "iso", "consent": "on",
                               "attachment": pdf("plan.pdf")}, HTTP_ORIGIN=ORIGIN)
        self.obj = ContactRequest.objects.get()
        self.download = reverse("admin:contact_contactrequest_attachment", args=[self.obj.pk])

    def test_attachment_download_is_staff_only(self):
        self.assertEqual(self.client.get(self.download).status_code, 302)  # → login page
        admin = get_user_model().objects.create_superuser("admin", "a@example.com", "a-long-test-password")
        self.client.force_login(admin)
        res = self.client.get(self.download)
        self.assertEqual(res.status_code, 200)
        self.assertIn('filename="plan.pdf"', res["Content-Disposition"])
        self.assertTrue(b"".join(res.streaming_content).startswith(b"%PDF-"))

    def test_csv_export(self):
        admin = get_user_model().objects.create_superuser("admin", "a@example.com", "a-long-test-password")
        self.client.force_login(admin)
        res = self.client.post(reverse("admin:contact_contactrequest_changelist"),
                               {"action": "export_csv", "_selected_action": [self.obj.pk]})
        self.assertEqual(res["Content-Type"], "text/csv; charset=utf-8")
        self.assertIn("Amel", res.content.decode("utf-8-sig"))

    def test_retention_purge_deletes_old_requests_and_their_files(self):
        path = Path(self.obj.attachment.path)
        ContactRequest.objects.filter(pk=self.obj.pk).update(created_at=timezone.now() - timedelta(days=400))
        call_command("purge_contact_requests", "--days", "365", stdout=io.StringIO())
        self.assertEqual(ContactRequest.objects.count(), 0)
        self.assertFalse(path.exists())
