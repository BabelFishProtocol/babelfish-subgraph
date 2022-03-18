#!/bin/bash

echo "waiting for graph node to be healthy..."
echo "Checking indexingStatuses..."

PORT=$GRAPHQL_PORT

if [[ -z "${PORT}" ]]; then
    echo "GRAPHQL_PORT env not set. Using default: 8030"
    PORT=8030
fi

is_healthy() {
    indexingStatuses=$(curl \
      -X POST \
      -d '{"query":"query{ indexingStatuses { subgraph } }"}' \
      http://localhost:$PORT/graphql \
      -stderr)

    data=$(echo $indexingStatuses | jq '.data')
    echo "Result: $data"
    

    if [ -z "$data" ]; then
        return 1
    else
        echo "OK"
        return 0
    fi
}

while ! is_healthy; do sleep 2; done
