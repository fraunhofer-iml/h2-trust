#!/bin/sh
echo "Starting deployment process of the ProofStorage smart contract"

./wait-for-it.sh blockchain:8545 --timeout=20 --strict -- echo "blockchain:8545 is up"

cd smart-contract || exit

echo "Installing dependencies"
npm ci

echo "Deploying the ProofStorage smart contract to blockchain:8545"
npm run deploy-private

echo "Finished deployment process of the ProofStorage smart contract"
