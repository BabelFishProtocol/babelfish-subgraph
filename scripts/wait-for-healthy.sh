#!/bin/bash

echo "waiting for graph node to be healthy..."
echo "Checking indexingStatuses..."

is_healthy() {
    indexingStatuses=$(curl \
      -X POST \
      -d '{"query":"query{ indexingStatuses { subgraph } }"}' \
      http://localhost:8030/graphql \
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
