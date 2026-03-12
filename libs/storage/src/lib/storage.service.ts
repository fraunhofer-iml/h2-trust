/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigurationService } from '@h2-trust/configuration';
import { DECENTRALIZED_STORAGE_CLIENT, CENTRALIZED_STORAGE_CLIENT } from './storage.tokens';

@Injectable()
export class StorageService {
  private readonly centralizedStorageBucketName: string;
  private readonly decentralizedStorageBucketName: string;

  readonly centralizedStorageUrl: string;

  constructor(
    @Inject(CENTRALIZED_STORAGE_CLIENT) private readonly centralizedStorage: S3Client,
    @Inject(DECENTRALIZED_STORAGE_CLIENT) private readonly decentralizedStorage: S3Client,
    private readonly configurationService: ConfigurationService,
  ) {
    const centralized = this.configurationService.getGlobalConfiguration().centralizedStorage;
    const decentralized = this.configurationService.getGlobalConfiguration().decentralizedStorage;

    this.centralizedStorageBucketName = centralized.bucketName;
    this.decentralizedStorageBucketName = decentralized.bucketName;

    const { endPoint, port, useSSL } = centralized;
    const protocol = useSSL ? 'https' : 'http';
    this.centralizedStorageUrl = `${protocol}://${endPoint}:${port}/${this.centralizedStorageBucketName}`;
  }

  async uploadPdfFile(fileName: string, file: Buffer): Promise<string | undefined> {
    return this.putObject(this.centralizedStorage, this.centralizedStorageBucketName, fileName, file, 'application/pdf');
  }

  async downloadPdfFile(fileName: string): Promise<Stream.Readable> {
    const response = await this.centralizedStorage.send(new GetObjectCommand({ Bucket: this.centralizedStorageBucketName, Key: fileName }));
    return response.Body as Stream.Readable;
  }

  async pdfFileExists(fileName: string): Promise<boolean> {
    try {
      await this.centralizedStorage.send(new HeadObjectCommand({ Bucket: this.centralizedStorageBucketName, Key: fileName }));
      return true;
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async uploadCsvFile(fileName: string, file: Buffer): Promise<string | undefined> {
    return this.putObject(this.decentralizedStorage, this.decentralizedStorageBucketName, fileName, file, 'text/csv');
  }

  async downloadCsvFile(fileName: string): Promise<Stream.Readable> {
    const response = await this.decentralizedStorage.send(new GetObjectCommand({ Bucket: this.decentralizedStorageBucketName, Key: fileName }));
    return response.Body as Stream.Readable;
  }

  private async putObject(client: S3Client, bucket: string, key: string, body: Buffer, contentType: string): Promise<string | undefined> {
    let cid: string;
    const middlewareName = `cid-capture-${key}-${Date.now()}`;

    client.middlewareStack.add(
      (next) => async (args) => {
        const result = await next(args);
        cid = (result.response as any).headers?.['x-amz-meta-cid'];
        return result;
      },
      { step: 'deserialize', name: middlewareName },
    );

    try {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    } finally {
      client.middlewareStack.remove(middlewareName);
    }

    return cid;
  }
}
