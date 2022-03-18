#!/bin/bash
set -a

source .env_rskTestnet

yarn prepare-rskTestnet
yarn codegen
yarn build

yarn docker-up-rskTestnet

yarn wait-for-healthy
yarn create-rskTestnet
yarn deploy-rskTestnet
