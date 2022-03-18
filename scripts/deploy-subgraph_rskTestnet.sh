#!/bin/bash
set -a

source .env_rskTestnet

graph deploy babelfish/graph --ipfs http://127.0.0.1:$IPFS_PORT --node http://127.0.0.1:$SUBGRAPH_PORT_3