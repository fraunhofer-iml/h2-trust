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
import { DECENTRALIZED_STORAGE_CLIENT, CENTRALIZED_STORAGE_CLIENT } from './storage.tokens';

function createCentralizedStorageClient(configService: ConfigurationService): S3Client {
  return createS3Client(configService.getGlobalConfiguration().centralizedStorage, true);
}

function createDecentralizedStorageClient(configService: ConfigurationService): S3Client {
  return createS3Client(configService.getGlobalConfiguration().decentralizedStorage, false);
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

@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: CENTRALIZED_STORAGE_CLIENT,
      inject: [ConfigurationService],
      useFactory: createCentralizedStorageClient,
    },
    {
      provide: DECENTRALIZED_STORAGE_CLIENT,
      inject: [ConfigurationService],
      useFactory: createDecentralizedStorageClient,
    },
    CentralizedStorageService,
    DecentralizedStorageService,
  ],
  exports: [CentralizedStorageService, DecentralizedStorageService],
})
export class StorageModule { }
