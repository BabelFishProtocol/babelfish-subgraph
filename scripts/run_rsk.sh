#!/bin/bash
yarn prepare-rsk
yarn codegen ./subgraphConfig/subgraph.yaml
yarn build ./subgraphConfig/subgraph.yaml
yarn create-rsk
yarn deploy-rsk
