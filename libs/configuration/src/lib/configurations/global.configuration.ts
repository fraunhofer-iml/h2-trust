/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export const GLOBAL_CONFIGURATION_IDENTIFIER = 'global-configuration';

export interface GlobalConfiguration {
  logLevel: LogLevel[];
  amqp: AmqpConfiguration;
  minio: MinioConfiguration;
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
}

export interface KeycloakConfiguration {
  url: string;
  realm: string;
  tokenUri: string;
  clientId: string;
  clientSecret: string;
  grantType: string;
  username: string;
  password: string;
}

export default registerAs(GLOBAL_CONFIGURATION_IDENTIFIER, () => ({
  logLevel: (process.env['LOG_LEVEL'] || 'fatal,error,warn,log,debug').split(','),
  amqp: {
    uri: process.env['AMQP_URI'] || 'amqp://guest:guest@localhost:5672',
    queuePrefix: process.env['AMQP_QUEUE_PREFIX'] || 'h2-trust-dev-',
  },
  minio: {
    useSSL: process.env['MINIO_USE_SSL'] === 'true',
    endPoint: process.env['MINIO_ENDPOINT'] || 'localhost',
    port: parseInt(process.env['MINIO_PORT'] || '9000'),
    accessKey: process.env['MINIO_ACCESS_KEY'] || 'admin',
    secretKey: process.env['MINIO_SECRET_KEY'] || 'blockchain',
    bucketName: process.env['MINIO_BUCKET_NAME'] || 'h2-trust',
  },
  blockchain: {
    enabled: process.env['BLOCKCHAIN_ENABLED'] === 'true',
    rpcUrl: process.env['BLOCKCHAIN_RPC_URL'] || 'http://localhost:8545',
    privateKey: process.env['BLOCKCHAIN_PRIVATE_KEY'] || '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63',
    artifactPath: process.env['BLOCKCHAIN_ARTIFACT_PATH'] || 'libs/blockchain/smart-contract/artifacts/contracts/ProofStorage.sol/ProofStorage.json',
    smartContractAddress: process.env['BLOCKCHAIN_SMART_CONTRACT'] || '0x42699A7612A82f1d9C36148af9C77354759b210b',
  },
  keycloak: {
    url: process.env['KEYCLOAK_URL'] || '',
    realm: process.env['KEYCLOAK_REALM'] || '',
    tokenUri: process.env['KEYCLOAK_TOKEN_URI'] || 'protocol/openid-connect/token',
    clientId: process.env['KEYCLOAK_CLIENT_ID'] || '',
    clientSecret: process.env['KEYCLOAK_SECRET'] || '',
    username: process.env['KEYCLOAK_USER'] || '',
    password: process.env['KEYCLOAK_PASSWORD'] || '',
    grantType: process.env['KEYCLOAK_GRANT_TYPE'] || 'client_credentials',
  },
}));
