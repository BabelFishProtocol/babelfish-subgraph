#!/bin/bash
echo "Installing"
yarn
yarn prepare-rskTestnet
yarn codegen
docker-compose up -d postgres && sleep 10 && docker-compose up -d
echo "Waiting for 1 minutes..."
sleep 1m
yarn create-rskTestnet
echo "Waiting for 1 minutes..."
sleep 1m
yarn deploy-rskTestnet
