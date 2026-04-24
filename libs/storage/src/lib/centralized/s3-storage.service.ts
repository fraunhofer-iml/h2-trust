/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import { ContentType } from '../content-types';
import { CentralizedStorageService } from './centralized-storage.service';

export class S3StorageService extends CentralizedStorageService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly client: S3Client;

  public readonly endpointUrl: string;

  constructor(
    s3ClientConfig: S3ClientConfig,
    private readonly bucketName: string,
  ) {
    super();

    this.client = new S3Client(s3ClientConfig);
    this.endpointUrl = `${s3ClientConfig.endpoint}/${this.bucketName}`;

    this.logger.debug('🔗 S3 initialized.');
    this.logger.debug(`🌐 Endpoint: ${this.endpointUrl}`);
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucketName, Key: fileName, Body: file, ContentType: contentType }),
    );

    this.logger.debug(`Uploaded '${fileName}'`);

    return `${this.endpointUrl}/${fileName}`;
  }

  async downloadFile(fileName: string): Promise<Readable> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }));

    if (!response.Body) {
      throw new Error(`Download failed: empty response body for '${fileName}'`);
    }

    return Readable.fromWeb(response.Body.transformToWebStream() as ReadableStream<Uint8Array>);
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
