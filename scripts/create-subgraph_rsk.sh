#!/bin/bash
set -a

source .env_rsk

graph create babelfish/graph --node http://127.0.0.1:$SUBGRAPH_PORT_3