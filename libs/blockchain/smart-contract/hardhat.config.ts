/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from 'hardhat/config';
import hardhatToolboxMochaEthersPlugin from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import 'dotenv/config';

const MNEMONIC = process.env.MNEMONIC || '';
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || '';

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: '0.8.28',
        settings: {
          evmVersion: 'cancun',
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    local: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
    private: {
      type: 'http',
      accounts: ['0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'], // genesis private key (account in docker/blockchain/genesis.json)
      chainId: 1337,
      chainType: 'l1',
      url: 'http://blockchain:8545',
    },
    arbitrumSepolia: {
      type: 'http',
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 1,
      },
      chainId: 421614,
      chainType: 'op',
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
    },
  },
  verify: {
    etherscan: {
      apiKey: ARBISCAN_API_KEY,
    },
  },
});
