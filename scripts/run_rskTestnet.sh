#!/bin/bash

yarn prepare-rskTestnet
yarn codegen
yarn build

yarn create-rskTestnet
yarn deploy-rskTestnet
