#!/bin/bash

rm -rf data
docker rm -f `docker ps -aq -f name=graph-node`
set -a
source .env_local

cat docker-compose.yml | envsubst | yarn docker-test-up

yarn wait-for-healthy
