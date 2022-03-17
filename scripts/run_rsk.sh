#!/bin/bash
set -a

source .env_rsk

yarn prepare-rsk
yarn codegen
yarn build

cat docker-compose.yml | envsubst | yarn docker-up

yarn wait-for-healthy
yarn run create
yarn deploy
