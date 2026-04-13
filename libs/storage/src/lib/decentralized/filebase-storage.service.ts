/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';
import { GetObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import { ContentType } from '../content-types';
import { DecentralizedStorageService } from './decentralized-storage.service';

export class FilebaseStorageService extends DecentralizedStorageService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly client: S3Client;

  constructor(
    private readonly clientConfig: S3ClientConfig,
    private readonly bucketName: string,
    endpointUrl: string,
    public readonly explorerUrl: string,
  ) {
    super();

    this.client = new S3Client(clientConfig);

    this.logger.debug('🔗 Filebase is used for decentralized file storage.');
    this.logger.debug(`🌐 Endpoint URL: ${endpointUrl}`);
    this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string> {
    // Fresh client per upload: each call gets an isolated middleware stack, preventing CID captures from interfering across concurrent uploads.
    const uploadClient = new S3Client(this.clientConfig);
    let cid: string | undefined;

    uploadClient.middlewareStack.add(
      (next) => async (args) => {
        const result = await next(args);
        cid = (result.response as any).headers?.['x-amz-meta-cid'];
        return result;
      },
      { step: 'deserialize' },
    );

    await uploadClient.send(
      new PutObjectCommand({ Bucket: this.bucketName, Key: fileName, Body: file, ContentType: contentType }),
    );

    if (!cid) {
      throw new Error(`Filebase did not return a CID for file: ${fileName}`);
    }

    this.logger.debug(`Added file ${fileName} to Filebase with CID: ${cid}`);

    return cid;
  }

  async downloadFile(fileName: string): Promise<Readable> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }));

    if (!response.Body) {
      throw new Error(`Download failed: empty response body for file: ${fileName}`);
    }

    return response.Body as Readable;
  }
}
