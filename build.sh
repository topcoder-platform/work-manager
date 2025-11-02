#!/bin/bash
set -eo pipefail

APP_NAME=$1
LOCK_FILE_LOCAL=""
LOCK_FILE_NAME=""
UPDATE_CACHE=0

echo "NODE ENV: $NODE_ENV"
echo "BABEL ENV: $BABEL_ENV"

# Build the container image
docker compose -f docker/docker-compose.yml build \
  --build-arg NODE_ENV=$NODE_ENV \
  --build-arg BABEL_ENV=$BABEL_ENV \
  --build-arg FILE_PICKER_API_KEY=$FILE_PICKER_API_KEY \
  --build-arg FORCE_DEV=$FORCE_DEV \
  $APP_NAME

# Create a throwaway container for copying artifacts
docker create --name app $APP_NAME:latest >/dev/null

# Determine which lockfile to compare (pnpm preferred, fallback to npm)
if [ -f pnpm-lock.yaml ]; then
  LOCK_FILE_NAME="pnpm-lock.yaml"
elif [ -f package-lock.json ]; then
  LOCK_FILE_NAME="package-lock.json"
fi

if [ -z "$LOCK_FILE_NAME" ] || [ ! -d node_modules ]; then
  UPDATE_CACHE=1
else
  # Compare lockfile from container with local copy
  cp "$LOCK_FILE_NAME" ".old-$LOCK_FILE_NAME"
  docker cp "app:/$APP_NAME/$LOCK_FILE_NAME" "$LOCK_FILE_NAME"
  set +e
  cmp "$LOCK_FILE_NAME" ".old-$LOCK_FILE_NAME" >/dev/null 2>&1
  CMP_STATUS=$?
  set -e
  if [ $CMP_STATUS -ne 0 ]; then
    UPDATE_CACHE=1
  fi
fi

if [ "$UPDATE_CACHE" -eq 1 ]; then
  echo "Lockfile changed or node_modules missing; refreshing local node_modules from container..."
  rm -rf node_modules
  docker cp "app:/$APP_NAME/node_modules" .
fi
