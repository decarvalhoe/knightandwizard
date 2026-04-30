#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

POSTGRES_USER="${POSTGRES_USER:-knightandwizard}"
POSTGRES_DB="${POSTGRES_DB:-knightandwizard}"
SCHEMA_OPTIONAL="false"

if [[ "${1:-}" == "--schema-optional" ]]; then
  SCHEMA_OPTIONAL="true"
fi

REQUIRED_TABLES=(
  catalog_documents
  game_sessions
  session_events
  session_decisions
  gm_memories
  audit_events
  knowledge_documents
  knowledge_chunks
)

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

MISSING_TABLES=()
for table in "${REQUIRED_TABLES[@]}"; do
  EXISTS="$(
    docker exec kw-postgres \
      psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT to_regclass('public.${table}') IS NOT NULL;"
  )"

  if [[ "$EXISTS" != "t" ]]; then
    MISSING_TABLES+=("$table")
  fi
done

if (( ${#MISSING_TABLES[@]} > 0 )); then
  if [[ "$SCHEMA_OPTIONAL" == "true" ]]; then
    echo "devlab ok: PostgreSQL is ready and pgvector is installed"
    echo "devlab warning: migrated schema is missing tables: ${MISSING_TABLES[*]}"
    echo "Run pnpm db:migrate before pnpm validate."
    exit 0
  fi

  echo "devlab schema is missing tables: ${MISSING_TABLES[*]}" >&2
  echo "Run pnpm db:migrate." >&2
  exit 1
fi

echo "devlab ok: PostgreSQL is ready, pgvector is installed, and migrated schema is present"
