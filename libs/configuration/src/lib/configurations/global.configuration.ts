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
  endpointUrl: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export interface KuboStorageConfiguration {
  provider: 'kubo';
  endpointUrl: string;
  explorerUrl: string;
}

export interface FilebaseStorageConfiguration extends StorageConfiguration {
  provider: 'filebase';
  explorerUrl: string;
}

export type DecentralizedStorageConfiguration =
  | KuboStorageConfiguration
  | FilebaseStorageConfiguration;

export type DecentralizedStorageProvider = 'kubo' | 'filebase';

export interface BlockchainConfiguration {
  enabled: boolean;
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

export default registerAs(GLOBAL_CONFIGURATION_IDENTIFIER, () => ({
  logLevel: requireEnv('LOG_LEVEL').split(','),
  amqp: {
    uri: requireEnv('AMQP_URI'),
    queuePrefix: requireEnv('AMQP_QUEUE_PREFIX'),
  } as AmqpConfiguration,
  centralizedStorage: {
    endpointUrl: requireEnv('CENTRALIZED_STORAGE_ENDPOINT_URL'),
    region: requireEnv('CENTRALIZED_STORAGE_REGION'),
    accessKey: requireEnv('CENTRALIZED_STORAGE_ACCESS_KEY'),
    secretKey: requireEnv('CENTRALIZED_STORAGE_SECRET_KEY'),
    bucketName: requireEnv('CENTRALIZED_STORAGE_BUCKET_NAME'),
  } as StorageConfiguration,
  decentralizedStorage: (() => {
    const provider = requireEnv('DECENTRALIZED_STORAGE_PROVIDER');
    if (provider === 'kubo') {
      return {
        provider,
        endpointUrl: requireEnv('DECENTRALIZED_STORAGE_ENDPOINT_URL'),
        explorerUrl: requireEnv('DECENTRALIZED_STORAGE_EXPLORER_URL'),
      } satisfies KuboStorageConfiguration;
    }
    if (provider === 'filebase') {
      return {
        provider,
        endpointUrl: requireEnv('DECENTRALIZED_STORAGE_ENDPOINT_URL'),
        explorerUrl: requireEnv('DECENTRALIZED_STORAGE_EXPLORER_URL'),
        region: requireEnv('DECENTRALIZED_STORAGE_REGION'),
        accessKey: requireEnv('DECENTRALIZED_STORAGE_ACCESS_KEY'),
        secretKey: requireEnv('DECENTRALIZED_STORAGE_SECRET_KEY'),
        bucketName: requireEnv('DECENTRALIZED_STORAGE_BUCKET_NAME'),
      } satisfies FilebaseStorageConfiguration;
    }
    throw new Error(`Unsupported DECENTRALIZED_STORAGE_PROVIDER: ${provider}`);
  })(),
  blockchain: {
    enabled: requireEnv('BLOCKCHAIN_ENABLED') === 'true',
    endpointUrl: requireEnv('BLOCKCHAIN_ENDPOINT_URL'),
    explorerUrl: requireEnv('BLOCKCHAIN_EXPLORER_URL'),
    privateKey: requireEnv('BLOCKCHAIN_PRIVATE_KEY'),
    artifactPath: requireEnv('BLOCKCHAIN_ARTIFACT_PATH'),
    smartContractAddress: requireEnv('BLOCKCHAIN_SMART_CONTRACT_ADDRESS'),
  } as BlockchainConfiguration,
  keycloak: {
    url: requireEnv('KEYCLOAK_URL'),
    realm: requireEnv('KEYCLOAK_REALM'),
    clientId: requireEnv('KEYCLOAK_CLIENT_ID'),
    clientSecret: requireEnv('KEYCLOAK_CLIENT_SECRET'),
  } as KeycloakConfiguration,
}));
