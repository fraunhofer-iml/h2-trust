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
import { S3_CLIENT } from './storage.tokens';

@Injectable()
export class StorageService {
  private readonly bucketName: string;

  readonly minioUrl: string;

  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    private readonly configurationService: ConfigurationService,
  ) {
    const minioConfig = this.configurationService.getGlobalConfiguration().minio;

    this.bucketName = minioConfig.bucketName;

    const { endPoint, port, useSSL } = minioConfig;
    const protocol = useSSL ? 'https' : 'http';
    this.minioUrl = `${protocol}://${endPoint}:${port}/${this.bucketName}`;
  }

  async uploadPdfFile(fileName: string, file: Buffer): Promise<string | undefined> {
    return this.putObject(fileName, file, 'application/pdf');
  }

  async uploadCsvFile(fileName: string, file: Buffer): Promise<string | undefined> {
    return this.putObject(fileName, file, 'text/csv');
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

  private async putObject(key: string, body: Buffer, contentType: string): Promise<string | undefined> {
    let cid: string | undefined;
    const middlewareName = `cid-capture-${key}-${Date.now()}`;

    this.client.middlewareStack.add(
      (next) => async (args) => {
        const result = await next(args);
        cid = (result.response as any).headers?.['x-amz-meta-cid'];
        return result;
      },
      { step: 'deserialize', name: middlewareName },
    );

    try {
      await this.client.send(new PutObjectCommand({ Bucket: this.bucketName, Key: key, Body: body, ContentType: contentType }));
    } finally {
      this.client.middlewareStack.remove(middlewareName);
    }

    return cid;
  }
}
