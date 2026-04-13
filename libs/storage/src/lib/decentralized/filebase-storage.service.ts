/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { Logger } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigurationService, DECENTRALIZED_STORAGE_PROVIDERS } from '@h2-trust/configuration';
import { DecentralizedStorageService } from './decentralized-storage.service';

export class FilebaseStorageService extends DecentralizedStorageService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly bucketName: string;

  public readonly explorerUrl: string;

  constructor(
    private readonly client: S3Client,
    configurationService: ConfigurationService,
  ) {
    super();

    const config = configurationService.getGlobalConfiguration().decentralizedStorage;

    if (config.provider !== DECENTRALIZED_STORAGE_PROVIDERS.FILEBASE) {
      throw new Error('FilebaseStorageService requires provider "filebase"');
    }

    this.bucketName = config.bucketName;
    this.explorerUrl = config.explorerUrl;

    this.logger.debug('🔗 Filebase is enabled. Files will be stored and retrieved.');
    this.logger.debug(`🌐 Endpoint URL: ${config.endpointUrl}`);
    this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);
  }

  async uploadCsvFile(fileName: string, file: Buffer): Promise<string | undefined> {
    let cid: string | undefined;
    const middlewareName = `cid-capture-${fileName}-${Date.now()}`;

    this.client.middlewareStack.add(
      (next) => async (args) => {
        const result = await next(args);
        cid = (result.response as any).headers?.['x-amz-meta-cid'];
        return result;
      },
      { step: 'deserialize', name: middlewareName },
    );

    try {
      await this.client.send(new PutObjectCommand({ Bucket: this.bucketName, Key: fileName, Body: file, ContentType: 'text/csv' }));
      this.logger.debug(`Added file ${fileName} to Filebase with CID: ${cid}`);
    } finally {
      this.client.middlewareStack.remove(middlewareName);
    }

    return cid;
  }

  async downloadFile(fileName: string): Promise<Readable> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }));
    return response.Body as Readable;
  }
}
