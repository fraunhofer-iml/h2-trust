import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import "dotenv/config";

const MNEMONIC = process.env.MNEMONIC || "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "";

if (!MNEMONIC) {
  throw new Error("Missing MNEMONIC in .env");
}

if (!ARBISCAN_API_KEY) {
  throw new Error("Missing ARBISCAN_API_KEY in .env");
}

export default defineConfig({
  plugins: [
    hardhatToolboxMochaEthersPlugin
  ],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
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
      type: "edr-simulated",
      chainType: "l1",
    },
    arbitrumSepolia: {
      type: "http",
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 1,
      },
      chainId: 421614,
      chainType: "op",
      url: "https://sepolia-rollup.arbitrum.io/rpc",
    },
  },
  verify: {
    etherscan: {
      apiKey: ARBISCAN_API_KEY,
    },
  },
});
