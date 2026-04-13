/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigurationModule, ConfigurationService, DECENTRALIZED_STORAGE_PROVIDERS, StorageConfiguration } from '@h2-trust/configuration';
import { CentralizedStorageService } from './centralized/centralized-storage.service';
import { S3StorageService } from './centralized/s3-storage.service';
import { DecentralizedStorageService } from './decentralized/decentralized-storage.service';
import { FilebaseStorageService } from './decentralized/filebase-storage.service';
import { KuboStorageService } from './decentralized/kubo-storage.service';

function createCentralizedStorageService(configService: ConfigurationService): CentralizedStorageService {
  const config = configService.getGlobalConfiguration().centralizedStorage;
  const clientConfig = buildS3ClientConfig(config, true);
  const client = new S3Client(clientConfig);
  return new S3StorageService(client, config.bucketName, `${config.endpointUrl}/${config.bucketName}`);
}

function createDecentralizedStorageService(configService: ConfigurationService): DecentralizedStorageService {
  let service: DecentralizedStorageService;
  const config = configService.getGlobalConfiguration().decentralizedStorage;

  switch (config.provider) {
    case DECENTRALIZED_STORAGE_PROVIDERS.KUBO: {
      service = new KuboStorageService(config.endpointUrl, config.explorerUrl);
      break;
    }
    case DECENTRALIZED_STORAGE_PROVIDERS.FILEBASE: {
      const clientConfig = buildS3ClientConfig(config, false);
      service = new FilebaseStorageService(clientConfig, config.bucketName, config.endpointUrl, config.explorerUrl);
      break;
    }
    default:
      throw new Error('Unsupported decentralized storage provider');
  }

  return service;
}

function buildS3ClientConfig(config: StorageConfiguration, forcePathStyle: boolean): S3ClientConfig {
  return {
    endpoint: config.endpointUrl,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle,
  };
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
