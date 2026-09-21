#!/bin/sh
# Wait for PostgreSQL, apply migrations, prepare the rate-limit cache table and static files.
set -e

if [ "${DATABASE_ENGINE:-postgres}" = "postgres" ]; then
python - <<'PY'
import os, sys, time
import psycopg

for attempt in range(60):
    try:
        psycopg.connect(
            host=os.environ.get("POSTGRES_HOST", "db"), port=os.environ.get("POSTGRES_PORT", "5432"),
            dbname=os.environ.get("POSTGRES_DB", "hyperlink"), user=os.environ.get("POSTGRES_USER", "hyperlink"),
            password=os.environ.get("POSTGRES_PASSWORD", ""), connect_timeout=2,
        ).close()
        break
    except Exception:
        time.sleep(1)
else:
    sys.exit("PostgreSQL is not reachable")
PY
fi

python manage.py migrate --noinput
python manage.py createcachetable
python manage.py collectstatic --noinput --verbosity 0

exec "$@"
