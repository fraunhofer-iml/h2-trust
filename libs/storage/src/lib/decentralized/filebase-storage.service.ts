/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigurationService } from '@h2-trust/configuration';
import { DecentralizedStorageService } from './decentralized-storage.service';

export class FilebaseStorageService extends DecentralizedStorageService {
  private readonly bucketName: string;

  public readonly explorerUrl: string;

  constructor(
    private readonly client: S3Client,
    configurationService: ConfigurationService,
  ) {
    super();

    const config = configurationService.getGlobalConfiguration().decentralizedStorage;

    if (config.provider !== 'filebase') {
      throw new Error('FilebaseStorageService requires provider "filebase"');
    }

    this.bucketName = config.bucketName;
    this.explorerUrl = config.explorerUrl;
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
    } finally {
      this.client.middlewareStack.remove(middlewareName);
    }

    return cid;
  }

  async downloadFile(fileName: string): Promise<Stream.Readable> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }));
    return response.Body as Stream.Readable;
  }
}
