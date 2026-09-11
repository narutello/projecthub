#!/bin/sh
set -eu
cd /workspace

# Preview-only fallbacks so the Admin Panel works in the live sandbox.
# Override by exporting ADMIN_EMAIL / ADMIN_PASSWORD before start.
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@projecthub.app}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-hub-admin-2026}"

# :8081 is QA-only — a revive must never inherit a stale built-output preview.
node scripts/preview.mjs stop || true
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
