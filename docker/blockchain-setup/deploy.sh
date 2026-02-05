#!/bin/sh
echo "Starting deployment process of the ProofStorage smart contract"

cd smart-contract || exit

echo "Deploying the ProofStorage smart contract to blockchain:8545"
npm run deploy-private

echo "Finished deployment process of the ProofStorage smart contract"
