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

export interface MinioConfiguration {
  endPoint: string;
  port: number;
  useSSL: boolean;
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

export interface GlobalConfiguration {
  logLevel: LogLevel[];
  amqpUri: string;
  blockchain: BlockchainConfiguration;
  minio: MinioConfiguration;
}

export default registerAs(GLOBAL_CONFIGURATION_IDENTIFIER, () => ({
  logLevel: (process.env['LOG_LEVEL'] || 'fatal,error,warn,log,debug').split(','),
  amqpUri: process.env['AMQP_URI'] || 'amqp://localhost:5672',
  blockchain: {
    enabled: process.env['BLOCKCHAIN_ENABLED'] === 'true',
    rpcUrl: process.env['BLOCKCHAIN_RPC_URL'] || '',
    privateKey: process.env['BLOCKCHAIN_PRIVATE_KEY'] || '',
    artifactPath: process.env['BLOCKCHAIN_ARTIFACT_PATH'] || '',
    smartContractAddress: process.env['BLOCKCHAIN_SMART_CONTRACT'] || '',
  },
  minio: {
    endPoint: process.env['MINIO_ENDPOINT'] || 'localhost',
    port: parseInt(process.env['MINIO_PORT'] || '9000'),
    useSSL: process.env['MINIO_USE_SSL'] === 'true',
    accessKey: process.env['MINIO_ACCESS_KEY'] || 'admin',
    secretKey: process.env['MINIO_SECRET_KEY'] || 'blockchain',
    bucketName: process.env['MINIO_BUCKET_NAME'] || 'h2-trust',
  },
}));
