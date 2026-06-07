#!/bin/bash
set -e

DB_URL="${DATABASE_URL:-postgresql://fake:fake@localhost:5432/fake}"

echo "→ prisma generate..."
DATABASE_URL="$DB_URL" ./node_modules/.bin/prisma generate

if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" != *"fake"* ]]; then
  echo "→ prisma db push (applying schema to Neon)..."
  ./node_modules/.bin/prisma db push --url="$DATABASE_URL" --accept-data-loss --skip-generate
  echo "→ Schema applied successfully"
else
  echo "→ Skipping db push (no real DATABASE_URL)"
fi

echo "→ next build..."
./node_modules/.bin/next build
