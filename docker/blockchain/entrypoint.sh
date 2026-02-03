#!/bin/sh

set -o errexit
set -o nounset

echo "Starting Alice's node"
besu --api-gas-price-max=0 --logging=WARN --data-path=alice-data --data-storage-format=FOREST --genesis-file=data/genesis.json --host-allowlist='*' --min-gas-price=0 --nat-method=DOCKER --node-private-key-file=alice-data/key.priv --p2p-enabled=true --p2p-port=30303 --revert-reason-enabled=true --rpc-http-enabled=true --rpc-http-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-http-cors-origins='*' --rpc-http-port=8545 --rpc-max-logs-range=0 --rpc-ws-enabled=true --rpc-ws-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-ws-port=8546 --sync-mode=FULL --tx-pool-min-gas-price=0 &

echo "Starting Bob's node"
besu --api-gas-price-max=0 --logging=WARN --data-path=bob-data --data-storage-format=FOREST --genesis-file=data/genesis.json --host-allowlist='*' --min-gas-price=0 --nat-method=DOCKER --node-private-key-file=bob-data/key.priv --p2p-enabled=true --p2p-port=30304 --revert-reason-enabled=true --rpc-http-enabled=true --rpc-http-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-http-cors-origins='*' --rpc-http-port=8547 --rpc-max-logs-range=0 --rpc-ws-enabled=true --rpc-ws-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-ws-port=8548 --sync-mode=FULL --tx-pool-min-gas-price=0 &

echo "Starting Carol's node"
besu --api-gas-price-max=0 --logging=WARN --data-path=carol-data --data-storage-format=FOREST --genesis-file=data/genesis.json --host-allowlist='*' --min-gas-price=0 --nat-method=DOCKER --node-private-key-file=carol-data/key.priv --p2p-enabled=true --p2p-port=30305 --revert-reason-enabled=true --rpc-http-enabled=true --rpc-http-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-http-cors-origins='*' --rpc-http-port=8549 --rpc-max-logs-range=0 --rpc-ws-enabled=true --rpc-ws-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-ws-port=8550 --sync-mode=FULL --tx-pool-min-gas-price=0 &

echo "Starting Dan's node"
besu --api-gas-price-max=0 --logging=WARN --data-path=dan-data --data-storage-format=FOREST --genesis-file=data/genesis.json --host-allowlist='*' --min-gas-price=0 --nat-method=DOCKER --node-private-key-file=dan-data/key.priv --p2p-enabled=true --p2p-port=30306 --revert-reason-enabled=true --rpc-http-enabled=true --rpc-http-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-http-cors-origins='*' --rpc-http-port=8551 --rpc-max-logs-range=0 --rpc-ws-enabled=true --rpc-ws-api=ADMIN,DEBUG,ETH,NET,QBFT,TRACE,TXPOOL,WEB3 --rpc-ws-port=8552 --sync-mode=FULL --tx-pool-min-gas-price=0 &

wait
