#!/bin/bash
set -a

source ../.env_local

cat docker-compose.yml | envsubst | yarn docker-test-up

yarn wait-for-healthy
