#!/bin/bash
set -e

# prisma generate only needs a valid URL format — use fallback if DATABASE_URL missing
export DATABASE_URL="${DATABASE_URL:-postgresql://fake:fake@localhost:5432/fake}"

echo "→ Running prisma generate..."
./node_modules/.bin/prisma generate

# Only push schema if we have a real (non-fake) DATABASE_URL
if [[ "$DATABASE_URL" != *"fake"* ]]; then
  echo "→ Running prisma db push..."
  ./node_modules/.bin/prisma db push --accept-data-loss
else
  echo "→ Skipping prisma db push (no real DATABASE_URL)"
fi

echo "→ Running next build..."
./node_modules/.bin/next build
