#!/bin/bash
echo "Installing"
yarn prepare-rsk
yarn codegen
yarn dev:up
echo "Waiting for 2 minutes..."
sleep 5m
yarn create-local
yarn deploy-local

