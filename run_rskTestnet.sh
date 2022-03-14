#!/bin/bash
set -a

rm -rf data
docker rm -f `docker ps -aq -f name=graph-node`
source .env_rskTestnet

yarn prepare-rskTestnet
yarn build

cat docker-compose.yml | envsubst | yarn docker-up

yarn wait-for-healthy
yarn run create
yarn deploy
