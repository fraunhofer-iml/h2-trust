/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { S3ClientConfig } from '@aws-sdk/client-s3';
import { ConfigurationService, DECENTRALIZED_STORAGE_PROVIDERS, StorageConfiguration } from '@h2-trust/configuration';
import { CentralizedStorageService } from './centralized/centralized-storage.service';
import { S3StorageService } from './centralized/s3-storage.service';
import { DecentralizedStorageService } from './decentralized/decentralized-storage.service';
import { KuboStorageService } from './decentralized/kubo-storage.service';
import { FilebaseStorageService } from './decentralized/filebase-storage.service';

export function createCentralizedStorageService(configService: ConfigurationService): CentralizedStorageService {
  const config = configService.getGlobalConfiguration().centralizedStorage;
  const clientConfig = buildS3ClientConfig(config, true);
  return new S3StorageService(clientConfig, config.bucketName, config.endpointUrl);
}

export function createDecentralizedStorageService(configService: ConfigurationService): DecentralizedStorageService {
  const config = configService.getGlobalConfiguration().decentralizedStorage;

  switch (config.provider) {
    case DECENTRALIZED_STORAGE_PROVIDERS.KUBO:
      return new KuboStorageService(config.endpointUrl, config.explorerUrl);
    case DECENTRALIZED_STORAGE_PROVIDERS.FILEBASE: {
      const clientConfig = buildS3ClientConfig(config, false);
      return new FilebaseStorageService(clientConfig, config.bucketName, config.endpointUrl, config.explorerUrl);
    }
    default:
      throw new Error('Unsupported decentralized storage provider');
  }
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
