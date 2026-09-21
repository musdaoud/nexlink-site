from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from contact.models import ContactRequest


class Command(BaseCommand):
    help = "Delete contact requests (and their attachments) older than the retention period."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=settings.CONTACT_RETENTION_DAYS,
                            help=f"retention in days (default: CONTACT_RETENTION_DAYS = {settings.CONTACT_RETENTION_DAYS})")
        parser.add_argument("--dry-run", action="store_true", help="only count what would be deleted")

    def handle(self, *args, days, dry_run, **options):
        cutoff = timezone.now() - timedelta(days=days)
        old = ContactRequest.objects.filter(created_at__lt=cutoff)
        count = old.count()
        if dry_run:
            self.stdout.write(f"{count} request(s) older than {days} days would be deleted.")
            return
        # delete one by one so each attachment file is removed too (post_delete signal)
        for obj in old.iterator():
            obj.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} request(s) older than {days} days."))
