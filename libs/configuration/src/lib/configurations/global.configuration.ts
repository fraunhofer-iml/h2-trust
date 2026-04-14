/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { requireEnv } from '../util';

export const GLOBAL_CONFIGURATION_IDENTIFIER = 'global-configuration';
export const DECENTRALIZED_STORAGE_PROVIDERS = {
  IPFS_NATIVE: 'ipfs-native',
  IPFS_PINNING: 'ipfs-pinning',
} as const;

export interface GlobalConfiguration {
  logLevel: LogLevel[];
  amqp: AmqpConfiguration;
  centralizedStorage: S3StorageConfiguration;
  decentralizedStorage?: DecentralizedStorageConfiguration;
  blockchain?: BlockchainConfiguration;
  keycloak: KeycloakConfiguration;
  featureFlags: FeatureFlags;
}

export interface AmqpConfiguration {
  uri: string;
  queuePrefix: string;
}

export interface S3StorageConfiguration {
  endpointUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export interface IpfsNativeStorageConfiguration {
  provider: typeof DECENTRALIZED_STORAGE_PROVIDERS.IPFS_NATIVE;
  endpointUrl: string;
  explorerUrl: string;
}

export interface IpfsPinningStorageConfiguration extends S3StorageConfiguration {
  provider: typeof DECENTRALIZED_STORAGE_PROVIDERS.IPFS_PINNING;
  explorerUrl: string;
}

export type DecentralizedStorageConfiguration = IpfsNativeStorageConfiguration | IpfsPinningStorageConfiguration;

export interface BlockchainConfiguration {
  endpointUrl: string;
  privateKey: string;
  artifactPath: string;
  smartContractAddress: string;
  explorerUrl: string;
}

export interface KeycloakConfiguration {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}

export interface FeatureFlags {
  verificationEnabled: boolean;
}

export default registerAs(GLOBAL_CONFIGURATION_IDENTIFIER, () => {
  const verificationEnabled = requireEnv('FEATURE_VERIFICATION_ENABLED') === 'true';

  return {
    logLevel: requireEnv('LOG_LEVEL').split(','),
    amqp: {
      uri: requireEnv('AMQP_URI'),
      queuePrefix: requireEnv('AMQP_QUEUE_PREFIX'),
    } satisfies AmqpConfiguration,
    centralizedStorage: {
      endpointUrl: requireEnv('CENTRALIZED_STORAGE_ENDPOINT_URL'),
      region: requireEnv('CENTRALIZED_STORAGE_REGION'),
      accessKey: requireEnv('CENTRALIZED_STORAGE_ACCESS_KEY'),
      secretKey: requireEnv('CENTRALIZED_STORAGE_SECRET_KEY'),
      bucketName: requireEnv('CENTRALIZED_STORAGE_BUCKET_NAME'),
    } satisfies S3StorageConfiguration,
    decentralizedStorage: verificationEnabled ? buildDecentralizedStorageConfig() : undefined,
    blockchain: verificationEnabled ? buildBlockchainConfig() : undefined,
    keycloak: {
      url: requireEnv('KEYCLOAK_URL'),
      realm: requireEnv('KEYCLOAK_REALM'),
      clientId: requireEnv('KEYCLOAK_CLIENT_ID'),
      clientSecret: requireEnv('KEYCLOAK_CLIENT_SECRET'),
    } satisfies KeycloakConfiguration,
    featureFlags: {
      verificationEnabled,
    } satisfies FeatureFlags,
  };
});

function buildDecentralizedStorageConfig(): DecentralizedStorageConfiguration {
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

function buildBlockchainConfig(): BlockchainConfiguration {
  return {
    endpointUrl: requireEnv('BLOCKCHAIN_ENDPOINT_URL'),
    explorerUrl: requireEnv('BLOCKCHAIN_EXPLORER_URL'),
    privateKey: requireEnv('BLOCKCHAIN_PRIVATE_KEY'),
    artifactPath: requireEnv('BLOCKCHAIN_ARTIFACT_PATH'),
    smartContractAddress: requireEnv('BLOCKCHAIN_SMART_CONTRACT_ADDRESS'),
  } satisfies BlockchainConfiguration;
}
