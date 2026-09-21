import io

import qrcode
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django_otp.plugins.otp_totp.models import TOTPDevice


class Command(BaseCommand):
    help = "Create (or reset) the authenticator-app device of an admin user and print its QR code."

    def add_arguments(self, parser):
        parser.add_argument("username")

    def handle(self, *args, username, **options):
        try:
            user = get_user_model().objects.get(username=username)
        except get_user_model().DoesNotExist:
            raise CommandError(f"No user named {username!r}. Create it first with `createsuperuser`.")
        TOTPDevice.objects.filter(user=user).delete()
        device = TOTPDevice.objects.create(user=user, name="authenticator", confirmed=True)

        qr = qrcode.QRCode(border=1)
        qr.add_data(device.config_url)
        out = io.StringIO()
        qr.print_ascii(out=out, invert=True)
        self.stdout.write(out.getvalue())
        self.stdout.write("Scan this with Google Authenticator, Microsoft Authenticator, Aegis…")
        self.stdout.write(f"Or enter this setup link manually:\n{device.config_url}\n")
        self.stdout.write(self.style.SUCCESS(f"2FA ready for {username}: log in with password + the 6-digit code."))
