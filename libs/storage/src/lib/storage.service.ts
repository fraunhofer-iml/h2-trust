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
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  public readonly storageUrl;

  private readonly bucketName;

  constructor(
    @Inject(MINIO_CONNECTION) private readonly client: Client,
    private readonly configurationService: ConfigurationService,
  ) {
    const globalConfiguration = this.configurationService.getGlobalConfiguration();

    if (!globalConfiguration) {
      throw new Error('GeneralConfiguration is not defined.');
    }

    this.storageUrl = `http://${globalConfiguration.minio.endPoint}:${globalConfiguration.minio.port}/${globalConfiguration.minio.bucketName}`;
    this.bucketName = globalConfiguration.minio.bucketName;
  }

  async uploadFileWithDeepPath(file: Express.Multer.File, entityPath: string, entityId: string) {
    const typeEnding = file.originalname.split('.').pop();
    const fileName = `${entityPath}/${entityId}/${randomUUID()}.${typeEnding}`;
    await this.uploadFile(fileName, Buffer.from(file.buffer));
    return fileName;
  }

  uploadFile(fileName: string, file: Buffer) {
    return this.client.putObject(this.bucketName, fileName, file);
  }

  downloadFile(fileName: string) {
    return this.client.getObject(this.bucketName, fileName);
  }

  deleteFile(fileName: string) {
    return this.client.removeObject(this.bucketName, fileName);
  }
}
