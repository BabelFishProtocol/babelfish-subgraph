#!/bin/bash
echo "Installing"
yarn prepare-rsk
yarn codegen
docker-compose up -d postgres && sleep 10 && docker-compose up -d
echo "Waiting for 1 minutes..."
sleep 1m
yarn create-rsk
echo "Waiting for 1 minutes..."
sleep 1m
yarn deploy-rsk

