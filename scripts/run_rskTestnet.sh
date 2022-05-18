#!/bin/bash
yarn prepare-rskTestnet
yarn codegen ./subgraphConfig/subgraph-rskTestnet.yaml
yarn build ./subgraphConfig/subgraph-rskTestnet.yaml
yarn create-rskTestnet
yarn deploy-rskTestnet
