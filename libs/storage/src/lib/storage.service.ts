/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import Stream from 'stream';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigurationService } from '@h2-trust/configuration';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly bucketName;

  constructor(
    @Inject(MINIO_CONNECTION) private readonly client: Client,
    private readonly configurationService: ConfigurationService,
  ) {
    this.bucketName = this.configurationService.getGlobalConfiguration().minio.bucketName;
  }

  async uploadFile(fileName: string, file: Buffer): Promise<void> {
    await this.client.putObject(this.bucketName, fileName, file, file.length);
  }

  async uploadFileWithRandomFileName(originalFileName: string, file: Buffer): Promise<string> {
    const fileExtension = originalFileName.split('.').pop().toLowerCase();
    const randomFileName = `${randomUUID()}.${fileExtension}`;
    await this.client.putObject(this.bucketName, randomFileName, file, file.length);
    return randomFileName;
  }

  async downloadFile(fileName: string): Promise<Stream.Readable> {
    return this.client.getObject(this.bucketName, fileName);
  }
}
