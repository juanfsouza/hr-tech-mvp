#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma || echo "Migration skipped or failed"

echo "Starting the application..."
exec node dist/main.js
