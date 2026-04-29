#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "This will delete local K&W devlab containers and PostgreSQL volume."
docker compose down --volumes --remove-orphans
docker compose up -d
pnpm devlab:test --schema-optional
