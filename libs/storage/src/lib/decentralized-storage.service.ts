/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { DECENTRALIZED_STORAGE_CLIENT } from './storage.tokens';
import { ConfigurationService } from '@h2-trust/configuration';

@Injectable()
export class DecentralizedStorageService {
  private readonly bucketName: string;

  public readonly explorerUrl: string;

  constructor(
    @Inject(DECENTRALIZED_STORAGE_CLIENT) private readonly client: S3Client,
    configurationService: ConfigurationService,
  ) {
    this.bucketName = configurationService.getGlobalConfiguration().decentralizedStorage.bucketName;
    this.explorerUrl = configurationService.getGlobalConfiguration().decentralizedStorage.explorerUrl;
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

  async downloadCsvFile(fileName: string): Promise<Stream.Readable> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }));
    return response.Body as Stream.Readable;
  }
}
