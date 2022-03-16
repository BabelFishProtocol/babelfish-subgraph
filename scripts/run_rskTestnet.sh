#!/bin/bash
set -a

source .env_rskTestnet

yarn prepare-rskTestnet
yarn codegen
yarn build

cat docker-compose.yml | envsubst | yarn docker-up

yarn wait-for-healthy
yarn run create
yarn deploy
