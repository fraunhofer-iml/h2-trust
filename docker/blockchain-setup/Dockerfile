FROM node:22-alpine3.22

WORKDIR /usr/src/app
COPY docker/blockchain-setup/ .
COPY libs/blockchain/smart-contract/contracts ./smart-contract/contracts
COPY libs/blockchain/smart-contract/scripts ./smart-contract/scripts
COPY libs/blockchain/smart-contract/hardhat.config.ts ./smart-contract/
COPY libs/blockchain/smart-contract/package.json ./smart-contract/
COPY libs/blockchain/smart-contract/package-lock.json ./smart-contract/
COPY libs/blockchain/smart-contract/tsconfig.json ./smart-contract/

RUN apk add --no-cache bash git

RUN chmod +x deploy.sh ./wait-for-it.sh

ENTRYPOINT ["./deploy.sh"]
