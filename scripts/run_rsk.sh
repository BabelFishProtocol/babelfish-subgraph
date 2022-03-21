#!/bin/bash
set -a

source .env_rsk

yarn prepare-rsk
yarn codegen
yarn build

yarn docker-up-rsk

yarn wait-for-healthy
yarn create-rsk
yarn deploy-rsk
