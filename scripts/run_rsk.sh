#!/bin/bash
yarn prepare-rsk
yarn codegen ./subgraphConfig/subgraph-mainnet.yaml
yarn build ./subgraphConfig/subgraph-mainnet.yaml
yarn create-rsk
yarn deploy-rsk
