/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { requireEnv } from '@h2-trust/utils';

export const DECENTRALIZED_STORAGE_PROVIDERS = {
  IPFS_NATIVE: 'ipfs-native',
  IPFS_PINNING: 'ipfs-pinning',
} as const;

export interface BlockchainConfiguration {
  endpointUrl: string;
  privateKey: string;
  artifactPath: string;
  smartContractAddress: string;
  explorerUrl: string;
}

export interface IpfsNativeStorageConfiguration {
  provider: typeof DECENTRALIZED_STORAGE_PROVIDERS.IPFS_NATIVE;
  endpointUrl: string;
  explorerUrl: string;
}

export interface IpfsPinningStorageConfiguration extends S3Configuration {
  provider: typeof DECENTRALIZED_STORAGE_PROVIDERS.IPFS_PINNING;
  explorerUrl: string;
}

export interface S3Configuration {
  endpointUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export type DecentralizedStorageConfiguration = IpfsNativeStorageConfiguration | IpfsPinningStorageConfiguration;

export interface VerificationConfiguration {
  blockchain: BlockchainConfiguration;
  decentralizedStorage: DecentralizedStorageConfiguration;
}

export function buildVerificationConfiguration(): VerificationConfiguration {
  return {
    blockchain: buildBlockchainConfiguration(),
    decentralizedStorage: buildDecentralizedStorageConfiguration(),
  };
}

function buildBlockchainConfiguration(): BlockchainConfiguration {
  return {
    endpointUrl: requireEnv('BLOCKCHAIN_ENDPOINT_URL'),
    explorerUrl: requireEnv('BLOCKCHAIN_EXPLORER_URL'),
    privateKey: requireEnv('BLOCKCHAIN_PRIVATE_KEY'),
    artifactPath: requireEnv('BLOCKCHAIN_ARTIFACT_PATH'),
    smartContractAddress: requireEnv('BLOCKCHAIN_SMART_CONTRACT_ADDRESS'),
  } satisfies BlockchainConfiguration;
}

function buildDecentralizedStorageConfiguration(): DecentralizedStorageConfiguration {
  const provider = requireEnv('DECENTRALIZED_STORAGE_PROVIDER');

  if (provider === DECENTRALIZED_STORAGE_PROVIDERS.IPFS_NATIVE) {
    return {
      provider,
      endpointUrl: requireEnv('DECENTRALIZED_STORAGE_ENDPOINT_URL'),
      explorerUrl: requireEnv('DECENTRALIZED_STORAGE_EXPLORER_URL'),
    } satisfies IpfsNativeStorageConfiguration;
  }

  if (provider === DECENTRALIZED_STORAGE_PROVIDERS.IPFS_PINNING) {
    return {
      provider,
      endpointUrl: requireEnv('DECENTRALIZED_STORAGE_ENDPOINT_URL'),
      explorerUrl: requireEnv('DECENTRALIZED_STORAGE_EXPLORER_URL'),
      region: requireEnv('DECENTRALIZED_STORAGE_REGION'),
      accessKey: requireEnv('DECENTRALIZED_STORAGE_ACCESS_KEY'),
      secretKey: requireEnv('DECENTRALIZED_STORAGE_SECRET_KEY'),
      bucketName: requireEnv('DECENTRALIZED_STORAGE_BUCKET_NAME'),
    } satisfies IpfsPinningStorageConfiguration;
  }

  throw new Error(`Unsupported decentralized storage provider: ${provider}`);
}
