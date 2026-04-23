/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { S3ClientConfig } from '@aws-sdk/client-s3';
import { ConfigurationService, DECENTRALIZED_STORAGE_PROVIDERS, S3Configuration } from '@h2-trust/configuration';
import { CentralizedStorageService } from './centralized/centralized-storage.service';
import { S3StorageService } from './centralized/s3-storage.service';
import { DecentralizedStorageService } from './decentralized/decentralized-storage.service';
import { IpfsNativeStorageService } from './decentralized/ipfs-native-storage.service';
import { IpfsPinningStorageService } from './decentralized/ipfs-pinning-storage.service';

export function createCentralizedStorageService(configService: ConfigurationService): CentralizedStorageService {
  const config = configService.getGlobalConfiguration().centralizedStorage;
  const s3ClientConfig = buildS3ClientConfig(config, true);
  return new S3StorageService(s3ClientConfig, config.bucketName);
}

export function createDecentralizedStorageService(
  configService: ConfigurationService,
): DecentralizedStorageService | null {
  const { featureFlags, verification } = configService.getGlobalConfiguration();

  if (!featureFlags.verificationEnabled || !verification) {
    return null;
  }

  const { decentralizedStorage } = verification;

  switch (decentralizedStorage.provider) {
    case DECENTRALIZED_STORAGE_PROVIDERS.IPFS_NATIVE:
      return new IpfsNativeStorageService(decentralizedStorage.endpointUrl, decentralizedStorage.explorerUrl);
    case DECENTRALIZED_STORAGE_PROVIDERS.IPFS_PINNING: {
      const s3ClientConfig = buildS3ClientConfig(decentralizedStorage, false);
      return new IpfsPinningStorageService(
        s3ClientConfig,
        decentralizedStorage.bucketName,
        decentralizedStorage.explorerUrl,
      );
    }
    default:
      throw new Error(`Unreachable: unhandled provider '${(decentralizedStorage as any).provider}'`);
  }
}

function buildS3ClientConfig(config: S3Configuration, forcePathStyle: boolean): S3ClientConfig {
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
