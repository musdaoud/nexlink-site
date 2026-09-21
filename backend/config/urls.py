from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

admin.site.site_header = "HyperLink — Administration"
admin.site.site_title = "HyperLink"
admin.site.index_title = "Demandes de contact"

if settings.ADMIN_REQUIRE_2FA:
    # Staff must enter a code from their authenticator app (see `manage.py setup_2fa`).
    from django_otp.admin import OTPAdminSite

    admin.site.__class__ = OTPAdminSite


def healthz(request):
    return JsonResponse({"ok": True})


urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/", include("contact.urls")),
    path("healthz", healthz),
]
