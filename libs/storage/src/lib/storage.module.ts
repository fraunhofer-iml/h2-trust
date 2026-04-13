/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigurationModule, ConfigurationService, StorageConfiguration } from '@h2-trust/configuration';
import { CentralizedStorageService } from './centralized-storage.service';
import { DecentralizedStorageService } from './decentralized-storage.service';
import { FilebaseStorageService } from './filebase-storage.service';
import { KuboStorageService } from './kubo-storage.service';
import { CENTRALIZED_STORAGE_CLIENT } from './storage.tokens';

function createCentralizedStorageClient(configService: ConfigurationService): S3Client {
  return createS3Client(configService.getGlobalConfiguration().centralizedStorage, true);
}

function createS3Client(config: StorageConfiguration, forcePathStyle: boolean): S3Client {
  const protocol = config.useSSL ? 'https' : 'http';
  return new S3Client({
    endpoint: `${protocol}://${config.endPoint}:${config.port}`,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle,
  });
}

function createDecentralizedStorageService(configService: ConfigurationService): DecentralizedStorageService {
  const config = configService.getGlobalConfiguration().decentralizedStorage;
  if (config.provider === 'kubo') {
    return new KuboStorageService(configService);
  }
  const s3Client = createS3Client(config, false);
  return new FilebaseStorageService(s3Client, configService);
}

@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: CENTRALIZED_STORAGE_CLIENT,
      inject: [ConfigurationService],
      useFactory: createCentralizedStorageClient,
    },
    {
      provide: DecentralizedStorageService,
      inject: [ConfigurationService],
      useFactory: createDecentralizedStorageService,
    },
    CentralizedStorageService,
  ],
  exports: [CentralizedStorageService, DecentralizedStorageService],
})
export class StorageModule {}
