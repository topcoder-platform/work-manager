#!/bin/bash
set -eo pipefail
APP_NAME=$1
UPDATE_CACHE=""
echo "NODE ENV: $NODE_ENV"
echo "BABEL ENV: $BABEL_ENV"
docker compose -f docker/docker-compose.yml build --build-arg NODE_ENV=$NODE_ENV --build-arg BABEL_ENV=$BABEL_ENV --build-arg FILE_PICKER_API_KEY=$FILE_PICKER_API_KEY --build-arg FORCE_DEV=$FORCE_DEV $APP_NAME
docker create --name app  $APP_NAME:latest

if [ -d node_modules ]
then
  mv package-lock.json old-package-lock.json
  docker cp app:/$APP_NAME/package-lock.json package-lock.json
  set +eo pipefail
  UPDATE_CACHE=$(cmp package-lock.json old-package-lock.json)
  set -eo pipefail
else
  UPDATE_CACHE=1
fi

if [ "$UPDATE_CACHE" == 1 ]
then
  docker cp app:/$APP_NAME/node_modules .
fi