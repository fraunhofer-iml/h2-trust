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

export class IpfsPinningStorageService extends DecentralizedStorageService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly client: S3Client;

  constructor(
    private readonly s3ClientConfig: S3ClientConfig,
    private readonly bucketName: string,
    public readonly explorerUrl: string,
    private readonly verificationEnabled: boolean,) {
    super();

    this.client = new S3Client(s3ClientConfig);

    if (this.verificationEnabled) {
      this.logger.debug('🔗 IPFS pinning service is used for decentralized file storage.');
      this.logger.debug(`🌐 Endpoint URL: ${this.s3ClientConfig.endpoint}`);
      this.logger.debug(`🧭 Explorer URL: ${this.explorerUrl}`);
    }
  }

  async uploadFile(fileName: string, file: Buffer, contentType: ContentType): Promise<string | null> {
    if (!this.verificationEnabled) {
      this.logger.debug(`⏭️ Verification feature disabled, skipping upload to IPFS pinning service for file: ${fileName}`);
      return null;
    }

    // Fresh client per upload: each call gets an isolated middleware stack, preventing CID captures from interfering across concurrent uploads.
    const uploadClient = new S3Client(this.s3ClientConfig);
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
      throw new Error(`IPFS pinning service did not return a CID for file: ${fileName}`);
    }

    this.logger.debug(`Added file ${fileName} to IPFS pinning service with CID: ${cid}`);

    return cid;
  }

  async downloadFile(fileName: string): Promise<Readable | null> {
    if (!this.verificationEnabled) {
      this.logger.debug(`⏭️ Verification feature disabled, skipping download from IPFS pinning service for file: ${fileName}`);
      return null;
    }

    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: fileName }));

    if (!response.Body) {
      throw new Error(`Download failed: empty response body for file: ${fileName}`);
    }

    return response.Body as Readable;
  }
}
