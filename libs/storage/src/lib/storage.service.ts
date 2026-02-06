/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigurationService } from '@h2-trust/configuration';
import 'multer';

@Injectable()
export class StorageService {
  private readonly bucketName;

  constructor(
    @Inject(MINIO_CONNECTION) private readonly client: Client,
    private readonly configurationService: ConfigurationService,
  ) {
    this.bucketName = this.configurationService.getGlobalConfiguration().minio.bucketName;
  }

  async uploadFile(fileName: string, file: Buffer) {
    return this.client.putObject(this.bucketName, fileName, file, file.length);
  }

  async uploadPdfFile(fileName: string, file: Buffer) {
    return this.client.putObject(this.bucketName, fileName, file, file.length, {
      'Content-Type': 'application/pdf',
    });
  }

  async downloadFile(fileName: string) {
    return this.client.getObject(this.bucketName, fileName);
  }

  async deleteFile(fileName: string) {
    return this.client.removeObject(this.bucketName, fileName);
  }

  async checkFIleExists(fileName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, fileName);
      return true;
    } catch (err: any) {
      if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
        return false;
      }
      throw err;
    }
  }
}
