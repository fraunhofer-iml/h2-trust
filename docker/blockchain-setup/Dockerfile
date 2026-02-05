FROM node:22-alpine3.23

WORKDIR /usr/src/app

# Install dependencies
COPY libs/blockchain/smart-contract/package.json ./smart-contract/
COPY libs/blockchain/smart-contract/package-lock.json ./smart-contract/
RUN cd smart-contract && npm ci --no-audit --no-fund --loglevel verbose

# Copy source files
COPY docker/blockchain-setup/deploy.sh .
COPY libs/blockchain/smart-contract/contracts ./smart-contract/contracts
COPY libs/blockchain/smart-contract/scripts ./smart-contract/scripts
COPY libs/blockchain/smart-contract/hardhat.config.ts ./smart-contract/
COPY libs/blockchain/smart-contract/tsconfig.json ./smart-contract/

RUN chmod +x deploy.sh

ENTRYPOINT ["./deploy.sh"]
