/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { CentralizedStorageService } from './centralized-storage.service';
import { ContentType } from '../content-types';
import { Logger } from '@nestjs/common';

export class S3StorageService extends CentralizedStorageService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly client: S3Client;

  public readonly baseUrl: string;

  constructor(
    clientConfig: S3ClientConfig,
    private readonly bucketName: string,
    private readonly endpointUrl: string,
  ) {
    super();

    this.client = new S3Client(clientConfig);
    this.baseUrl = `${this.endpointUrl}/${this.bucketName}`;

    this.logger.debug('🔗 S3 is used for centralized file storage.');
    this.logger.debug(`🌐 Base URL: ${this.baseUrl}`);
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucketName, Key: fileName, Body: file, ContentType: contentType }));
  }

  async downloadFile(fileName: string): Promise<Stream.Readable> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }));
    return response.Body as Stream.Readable;
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: fileName }));
      return true;
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }
}
