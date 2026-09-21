from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import ContactRequest


@receiver(post_delete, sender=ContactRequest)
def delete_attachment_file(sender, instance, **kwargs):
    """Deleting a request (by hand or by the retention purge) also deletes its file."""
    if instance.attachment:
        instance.attachment.delete(save=False)
