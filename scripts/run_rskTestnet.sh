#!/bin/bash
echo "Installing"
yarn
yarn prepare-rskTestnet
yarn codegen
yarn dev:up
echo "Waiting for 2 minutes..."
sleep 2m
yarn create-local
yarn deploy-local
