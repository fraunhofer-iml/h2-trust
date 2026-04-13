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

function createCentralizedStorageService(configService: ConfigurationService): CentralizedStorageService {
  const config = configService.getGlobalConfiguration().centralizedStorage;
  return new CentralizedStorageService(createS3Client(config, true), configService);
}

function createDecentralizedStorageService(configService: ConfigurationService): DecentralizedStorageService {
  const config = configService.getGlobalConfiguration().decentralizedStorage;
  if (config.provider === 'kubo') {
    return new KuboStorageService(configService);
  }
  return new FilebaseStorageService(createS3Client(config, false), configService);
}

@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: CentralizedStorageService,
      inject: [ConfigurationService],
      useFactory: createCentralizedStorageService,
    },
    {
      provide: DecentralizedStorageService,
      inject: [ConfigurationService],
      useFactory: createDecentralizedStorageService,
    },
  ],
  exports: [CentralizedStorageService, DecentralizedStorageService],
})
export class StorageModule {}
