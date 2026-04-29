#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

POSTGRES_USER="${POSTGRES_USER:-knightandwizard}"
POSTGRES_DB="${POSTGRES_DB:-knightandwizard}"

docker compose ps
docker exec kw-postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"

EXTENSION="$(
  docker exec kw-postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT extname FROM pg_extension WHERE extname = 'vector';"
)"

if [[ "$EXTENSION" != "vector" ]]; then
  echo "pgvector extension is missing" >&2
  exit 1
fi

echo "devlab ok: PostgreSQL is ready and pgvector is installed"
