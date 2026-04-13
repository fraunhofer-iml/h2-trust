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

export interface GlobalConfiguration {
  logLevel: LogLevel[];
  amqp: AmqpConfiguration;
  centralizedStorage: StorageConfiguration;
  decentralizedStorage: DecentralizedStorageConfiguration;
  blockchain: BlockchainConfiguration;
  keycloak: KeycloakConfiguration;
}

export interface AmqpConfiguration {
  uri: string;
  queuePrefix: string;
}

export interface StorageConfiguration {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export type DecentralizedStorageProvider = 'filebase' | 'kubo';

export interface FilebaseStorageConfiguration extends StorageConfiguration {
  provider: 'filebase';
  explorerUrl: string;
}

export interface KuboStorageConfiguration {
  provider: 'kubo';
  apiUrl: string;
  gatewayUrl: string;
}

export type DecentralizedStorageConfiguration =
  | FilebaseStorageConfiguration
  | KuboStorageConfiguration;

export interface BlockchainConfiguration {
  enabled: boolean;
  rpcUrl: string;
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

export default registerAs(GLOBAL_CONFIGURATION_IDENTIFIER, () => ({
  logLevel: requireEnv('LOG_LEVEL').split(','),
  amqp: {
    uri: requireEnv('AMQP_URI'),
    queuePrefix: requireEnv('AMQP_QUEUE_PREFIX'),
  } as AmqpConfiguration,
  centralizedStorage: {
    endpoint: requireEnv('CENTRALIZED_STORAGE_ENDPOINT'),
    region: requireEnv('CENTRALIZED_STORAGE_REGION'),
    accessKey: requireEnv('CENTRALIZED_STORAGE_ACCESS_KEY'),
    secretKey: requireEnv('CENTRALIZED_STORAGE_SECRET_KEY'),
    bucketName: requireEnv('CENTRALIZED_STORAGE_BUCKET_NAME'),
  } as StorageConfiguration,
  decentralizedStorage: (() => {
    const provider = (process.env['DECENTRALIZED_STORAGE_PROVIDER'] ?? 'filebase') as DecentralizedStorageProvider;
    if (provider === 'kubo') {
      return {
        provider,
        apiUrl: requireEnv('DECENTRALIZED_STORAGE_API_URL'),
        gatewayUrl: requireEnv('DECENTRALIZED_STORAGE_GATEWAY_URL'),
      } satisfies KuboStorageConfiguration;
    }
    return {
      provider,
      endpoint: requireEnv('DECENTRALIZED_STORAGE_ENDPOINT'),
      region: requireEnv('DECENTRALIZED_STORAGE_REGION'),
      accessKey: requireEnv('DECENTRALIZED_STORAGE_ACCESS_KEY'),
      secretKey: requireEnv('DECENTRALIZED_STORAGE_SECRET_KEY'),
      bucketName: requireEnv('DECENTRALIZED_STORAGE_BUCKET_NAME'),
      explorerUrl: requireEnv('DECENTRALIZED_STORAGE_EXPLORER_URL'),
    } satisfies FilebaseStorageConfiguration;
  })(),
  blockchain: {
    enabled: requireEnv('BLOCKCHAIN_ENABLED') === 'true',
    rpcUrl: requireEnv('BLOCKCHAIN_RPC_URL'),
    privateKey: requireEnv('BLOCKCHAIN_PRIVATE_KEY'),
    artifactPath: requireEnv('BLOCKCHAIN_ARTIFACT_PATH'),
    smartContractAddress: requireEnv('BLOCKCHAIN_SMART_CONTRACT_ADDRESS'),
    explorerUrl: requireEnv('BLOCKCHAIN_EXPLORER_URL'),
  } as BlockchainConfiguration,
  keycloak: {
    url: requireEnv('KEYCLOAK_URL'),
    realm: requireEnv('KEYCLOAK_REALM'),
    clientId: requireEnv('KEYCLOAK_CLIENT_ID'),
    clientSecret: requireEnv('KEYCLOAK_CLIENT_SECRET'),
  } as KeycloakConfiguration,
}));
