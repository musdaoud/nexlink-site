# HyperLink — backend (contact form)

Django 5.2 LTS · Python 3.13 · PostgreSQL 17 · Docker · SMTP

The website stays a static site. This backend receives the contact form, stores each
request, emails the HyperLink team (with the attachment) and sends the visitor a
confirmation in their language. The team follows the requests in the Django admin.

```
website (static) ──POST multipart──▶ /api/contact/ ──▶ PostgreSQL + private file storage
                                          ├──▶ email to the team  (CONTACT_NOTIFY_TO)
                                          └──▶ confirmation to the visitor (FR / EN)
team ──▶ /gestion/ (Django admin): list, filters, status, notes, attachment, CSV export
```

## What's inside

| Path | Role |
|---|---|
| `contact/models.py` | `ContactRequest`: submitted fields + status, internal notes, email tracking |
| `contact/forms.py` | Server-side validation (Algerian phones, wilayas, needs, consent, file type *and* real file signature, 10 MB) |
| `contact/views.py` | `POST /api/contact/` — origin check, rate limit, honeypot, optional Turnstile, JSON errors |
| `contact/emails.py` + `templates/contact/emails/` | Team notification and visitor confirmation (HTML + text) |
| `contact/admin.py` | Back-office: filters, search, editable status, bulk actions, protected download, CSV export |
| `contact/management/commands/` | `purge_contact_requests` (retention) · `setup_2fa` (authenticator app for admins) |
| `contact/tests.py` | 19 tests: validation, files, anti-spam, emails, admin permissions, purge |
| `compose.yml` | Development: Django + PostgreSQL + Mailpit |
| `compose.prod.yml` + `docker/Caddyfile` | Production: Gunicorn behind Caddy (automatic HTTPS) |

## Run it locally

```bash
cd backend
cp .env.example .env          # then put your address in CONTACT_NOTIFY_TO
docker compose up -d --build
docker compose exec web python manage.py createsuperuser
```

- API: `http://localhost:8010/api/contact/`
- Admin: `http://localhost:8010/gestion/`
- **Mailpit** (every email the backend sends, nothing leaves your machine): `http://localhost:8025`

Serve the website from `127.0.0.1:8765` or `localhost:8765` (for example
`python3 -m http.server 8765` in the site folder): on localhost the form automatically
posts to this backend (see `js/site-config.js`).

Run the tests:

```bash
docker compose exec web python manage.py test contact
```

Port 8010 already taken? Start with `WEB_PORT=8020 docker compose up -d` and update
`SITE_ADMIN_BASE_URL` and `js/site-config.js`.

## Send real emails (Gmail, for testing)

1. Turn on 2-step verification on the Google account.
2. Create an **App password**: Google Account → Security → App passwords.
3. In `.env`, replace the Mailpit block with the Gmail block from `.env.example`
   (`EMAIL_HOST=smtp.gmail.com`, port 587, TLS, your address, the 16-character app password,
   and `DEFAULT_FROM_EMAIL` = the same Gmail address).
4. `docker compose up -d --force-recreate web`

When HyperLink has its own domain, use its mailbox's SMTP settings instead, and set up
SPF/DKIM on the domain so messages don't land in spam.

## Deploy (Algerian VPS or any Linux server with Docker)

1. Point a DNS name at the server, e.g. `api.hyperlink.dz`.
2. Copy the `backend/` folder to the server and create `.env` from `.env.example` with:
   `DJANGO_DEBUG=0`, a new `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS=api.hyperlink.dz`,
   `DJANGO_CSRF_TRUSTED_ORIGINS=https://api.hyperlink.dz`, a strong `POSTGRES_PASSWORD`,
   `CORS_ALLOWED_ORIGINS=https://hyperlink.dz,https://www.hyperlink.dz`, the real SMTP settings,
   `SITE_ADMIN_BASE_URL=https://api.hyperlink.dz`, `ADMIN_URL=` something non-obvious,
   `ADMIN_REQUIRE_2FA=1`, `API_DOMAIN=api.hyperlink.dz`, `RATELIMIT_IP_META_KEY=HTTP_X_FORWARDED_FOR`.
3. Start it:
   ```bash
   docker compose -f compose.prod.yml up -d --build
   docker compose -f compose.prod.yml exec web python manage.py createsuperuser
   docker compose -f compose.prod.yml exec web python manage.py setup_2fa <username>
   ```
4. In the website's `js/site-config.js`, set `formEndpoint` to `https://api.hyperlink.dz/api/contact/`.
5. Schedule on the server (cron):
   ```cron
   # nightly database backup, kept 30 days
   30 2 * * * cd /srv/hyperlink/backend && docker compose -f compose.prod.yml exec -T db pg_dump -U hyperlink hyperlink | gzip > /srv/backups/db-$(date +\%F).sql.gz && find /srv/backups -name 'db-*.sql.gz' -mtime +30 -delete
   # weekly retention purge
   0 3 * * 0 cd /srv/hyperlink/backend && docker compose -f compose.prod.yml exec -T web python manage.py purge_contact_requests
   ```
   Also back up the `private_media` Docker volume (attachments).

## Security & personal data

- Attachments are stored with random names outside any public URL and can only be downloaded
  from the admin by logged-in staff. Their type is checked by extension **and** file signature.
- Only the origins in `CORS_ALLOWED_ORIGINS` may post; 5 submissions per 10 min per IP;
  bots filling the hidden `website` field are silently ignored; Cloudflare Turnstile can be
  switched on with `TURNSTILE_SECRET` (and `turnstileSiteKey` in the website config).
- The request is saved **before** any email is sent: an SMTP failure never loses a lead
  (the admin shows which emails went out).
- Admin: 2FA in production, 8-hour sessions, custom URL, 12-character minimum passwords.
- Law 18-07 (Algeria): the form collects consent; requests are purged after
  `CONTACT_RETENTION_DAYS`; hosting in Algeria keeps the data in the country. The privacy
  policy page of the website should describe this processing.
