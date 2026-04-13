/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigurationModule, ConfigurationService, DECENTRALIZED_STORAGE_PROVIDERS, StorageConfiguration } from '@h2-trust/configuration';
import { CentralizedStorageService } from './centralized/centralized-storage.service';
import { MinioStorageService } from './centralized/minio-storage.service';
import { DecentralizedStorageService } from './decentralized/decentralized-storage.service';
import { FilebaseStorageService } from './decentralized/filebase-storage.service';
import { KuboStorageService } from './decentralized/kubo-storage.service';

function createCentralizedStorageService(configService: ConfigurationService): CentralizedStorageService {
  const config = configService.getGlobalConfiguration().centralizedStorage;
  const s3Client = createS3Client(config, true);
  return new MinioStorageService(s3Client, config.bucketName, `${config.endpointUrl}/${config.bucketName}`);
}

function createDecentralizedStorageService(configService: ConfigurationService): DecentralizedStorageService {
  const config = configService.getGlobalConfiguration().decentralizedStorage;

  switch (config.provider) {
    case DECENTRALIZED_STORAGE_PROVIDERS.KUBO:
      return new KuboStorageService(config.endpointUrl, config.explorerUrl);
    case DECENTRALIZED_STORAGE_PROVIDERS.FILEBASE: {
      const s3Client = createS3Client(config, false);
      return new FilebaseStorageService(s3Client, config.bucketName, config.endpointUrl, config.explorerUrl);
    }
    default:
      throw new Error('Unsupported decentralized storage provider');
  }
}

function createS3Client(config: StorageConfiguration, forcePathStyle: boolean): S3Client {
  return new S3Client({
    endpoint: config.endpointUrl,
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
