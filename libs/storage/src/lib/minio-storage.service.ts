/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigurationService } from '@h2-trust/configuration';
import { CentralizedStorageService } from './centralized-storage.service';

export class MinioStorageService extends CentralizedStorageService {
  private readonly bucketName: string;
  public readonly storageUrl: string;

  constructor(
    private readonly client: S3Client,
    configurationService: ConfigurationService,
  ) {
    super();

    const config = configurationService.getGlobalConfiguration().centralizedStorage;

    this.bucketName = config.bucketName;

    const protocol = config.useSSL ? 'https' : 'http';
    this.storageUrl = `${protocol}://${config.endPoint}:${config.port}/${this.bucketName}`;
  }

  async uploadCsvFile(fileName: string, file: Buffer): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucketName, Key: fileName, Body: file, ContentType: 'text/csv' }));
  }

  async uploadPdfFile(fileName: string, file: Buffer): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucketName, Key: fileName, Body: file, ContentType: 'application/pdf' }));
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
