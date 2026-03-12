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
  minio: MinioConfiguration;
  filebase: FilebaseConfiguration;
  blockchain: BlockchainConfiguration;
  keycloak: KeycloakConfiguration;
}

export interface AmqpConfiguration {
  uri: string;
  queuePrefix: string;
}

export interface MinioConfiguration {
  useSSL: boolean;
  endPoint: string;
  port: number;
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export interface FilebaseConfiguration {
  useSSL: boolean;
  endPoint: string;
  port: number;
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
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
  },
  minio: {
    useSSL: requireEnv('MINIO_USE_SSL') === 'true',
    endPoint: requireEnv('MINIO_ENDPOINT'),
    port: parseInt(requireEnv('MINIO_PORT')),
    region: requireEnv('MINIO_REGION'),
    accessKey: requireEnv('MINIO_ACCESS_KEY'),
    secretKey: requireEnv('MINIO_SECRET_KEY'),
    bucketName: requireEnv('MINIO_BUCKET_NAME'),
  },
  filebase: {
    useSSL: requireEnv('FILEBASE_USE_SSL') === 'true',
    endPoint: requireEnv('FILEBASE_ENDPOINT'),
    port: parseInt(requireEnv('FILEBASE_PORT')),
    region: requireEnv('FILEBASE_REGION'),
    accessKey: requireEnv('FILEBASE_ACCESS_KEY'),
    secretKey: requireEnv('FILEBASE_SECRET_KEY'),
    bucketName: requireEnv('FILEBASE_BUCKET_NAME'),
  },
  blockchain: {
    enabled: requireEnv('BLOCKCHAIN_ENABLED') === 'true',
    rpcUrl: requireEnv('BLOCKCHAIN_RPC_URL'),
    privateKey: requireEnv('BLOCKCHAIN_PRIVATE_KEY'),
    artifactPath: requireEnv('BLOCKCHAIN_ARTIFACT_PATH'),
    smartContractAddress: requireEnv('BLOCKCHAIN_SMART_CONTRACT_ADDRESS'),
    explorerUrl: requireEnv('BLOCKCHAIN_EXPLORER_URL'),
  },
  keycloak: {
    url: requireEnv('KEYCLOAK_URL'),
    realm: requireEnv('KEYCLOAK_REALM'),
    clientId: requireEnv('KEYCLOAK_CLIENT_ID'),
    clientSecret: requireEnv('KEYCLOAK_CLIENT_SECRET'),
  },
}));
