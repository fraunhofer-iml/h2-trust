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
  useSSL: boolean;
  endPoint: string;
  port: number;
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export interface DecentralizedStorageConfiguration extends StorageConfiguration {
  ipfsGatewayUrl: string;
}

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
    useSSL: requireEnv('CENTRALIZED_STORAGE_USE_SSL') === 'true',
    endPoint: requireEnv('CENTRALIZED_STORAGE_ENDPOINT'),
    port: parseInt(requireEnv('CENTRALIZED_STORAGE_PORT')),
    region: requireEnv('CENTRALIZED_STORAGE_REGION'),
    accessKey: requireEnv('CENTRALIZED_STORAGE_ACCESS_KEY'),
    secretKey: requireEnv('CENTRALIZED_STORAGE_SECRET_KEY'),
    bucketName: requireEnv('CENTRALIZED_STORAGE_BUCKET_NAME'),
  } as StorageConfiguration,
  decentralizedStorage: {
    useSSL: requireEnv('DECENTRALIZED_STORAGE_USE_SSL') === 'true',
    endPoint: requireEnv('DECENTRALIZED_STORAGE_ENDPOINT'),
    port: parseInt(requireEnv('DECENTRALIZED_STORAGE_PORT')),
    region: requireEnv('DECENTRALIZED_STORAGE_REGION'),
    accessKey: requireEnv('DECENTRALIZED_STORAGE_ACCESS_KEY'),
    secretKey: requireEnv('DECENTRALIZED_STORAGE_SECRET_KEY'),
    bucketName: requireEnv('DECENTRALIZED_STORAGE_BUCKET_NAME'),
    ipfsGatewayUrl: requireEnv('DECENTRALIZED_STORAGE_IPFS_GATEWAY_URL'),
  } as DecentralizedStorageConfiguration,
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
