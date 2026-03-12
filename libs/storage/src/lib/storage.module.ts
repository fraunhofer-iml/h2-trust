/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigurationModule, ConfigurationService } from '@h2-trust/configuration';
import { StorageService } from './storage.service';
import { S3_CLIENT } from './storage.tokens';

@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigurationService],
      useFactory: (configService: ConfigurationService) => {
        const config = configService.getGlobalConfiguration().minio;
        const protocol = config.useSSL ? 'https' : 'http';
        return new S3Client({
          endpoint: `${protocol}://${config.endPoint}:${config.port}`,
          region: config.region,
          credentials: {
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
          },
          forcePathStyle: true,
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule { }
