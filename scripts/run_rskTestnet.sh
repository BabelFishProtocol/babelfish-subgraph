#!/bin/bash
yarn prepare-rskTestnet
yarn codegen ./subgraphConfig/subgraph-testnet.yaml
yarn build ./subgraphConfig/subgraph-testnet.yaml
yarn create-rskTestnet
yarn deploy-rskTestnet
