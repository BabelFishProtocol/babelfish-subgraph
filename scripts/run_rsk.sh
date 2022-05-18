#!/bin/bash
yarn prepare-rsk
yarn codegen ./subgraphConfig/subgraph-rsk.yaml
yarn build ./subgraphConfig/subgraph-rsk.yaml
yarn create-rsk
yarn deploy-rsk
