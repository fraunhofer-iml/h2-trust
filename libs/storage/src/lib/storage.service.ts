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
import { FILEBASE_CLIENT, MINIO_CLIENT } from './storage.tokens';

@Injectable()
export class StorageService {
  private readonly minioBucketName: string;
  private readonly filebaseBucketName: string;

  readonly minioUrl: string;

  constructor(
    @Inject(MINIO_CLIENT) private readonly minioClient: S3Client,
    @Inject(FILEBASE_CLIENT) private readonly filebaseClient: S3Client,
    private readonly configurationService: ConfigurationService,
  ) {
    const minioConfig = this.configurationService.getGlobalConfiguration().minio;
    const filebaseConfig = this.configurationService.getGlobalConfiguration().filebase;

    this.minioBucketName = minioConfig.bucketName;
    this.filebaseBucketName = filebaseConfig.bucketName;

    const { endPoint, port, useSSL } = minioConfig;
    const protocol = useSSL ? 'https' : 'http';
    this.minioUrl = `${protocol}://${endPoint}:${port}/${this.minioBucketName}`;
  }

  async uploadPdfFile(fileName: string, file: Buffer): Promise<string | undefined> {
    return this.putObject(this.minioClient, this.minioBucketName, fileName, file, 'application/pdf');
  }

  async downloadPdfFile(fileName: string): Promise<Stream.Readable> {
    const response = await this.minioClient.send(new GetObjectCommand({ Bucket: this.minioBucketName, Key: fileName }));
    return response.Body as Stream.Readable;
  }

  async pdfFileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.send(new HeadObjectCommand({ Bucket: this.minioBucketName, Key: fileName }));
      return true;
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async uploadCsvFile(fileName: string, file: Buffer): Promise<string | undefined> {
    return this.putObject(this.filebaseClient, this.filebaseBucketName, fileName, file, 'text/csv');
  }

  async downloadCsvFile(fileName: string): Promise<Stream.Readable> {
    const response = await this.filebaseClient.send(new GetObjectCommand({ Bucket: this.filebaseBucketName, Key: fileName }));
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
