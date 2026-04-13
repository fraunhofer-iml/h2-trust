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
import { CentralizedStorageService } from './centralized/centralized-storage.service';
import { MinioStorageService } from './centralized/minio-storage.service';
import { DecentralizedStorageService } from './decentralized/decentralized-storage.service';
import { FilebaseStorageService } from './decentralized/filebase-storage.service';
import { KuboStorageService } from './decentralized/kubo-storage.service';

function createCentralizedStorageService(configService: ConfigurationService): CentralizedStorageService {
  const config = configService.getGlobalConfiguration().centralizedStorage;
  const s3Client = createS3Client(config, true);
  return new MinioStorageService(s3Client, configService);
}

function createDecentralizedStorageService(configService: ConfigurationService): DecentralizedStorageService {
  let service: DecentralizedStorageService;
  const config = configService.getGlobalConfiguration().decentralizedStorage;

  switch (config.provider) {
    case 'filebase':
      const s3Client = createS3Client(config, false);
      service = new FilebaseStorageService(s3Client, configService);
      break;
    case 'kubo':
      service = new KuboStorageService(configService);
      break;
    default: {
      throw new Error('Unsupported decentralized storage provider');
    }
  }

  return service;
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
export class StorageModule { }
