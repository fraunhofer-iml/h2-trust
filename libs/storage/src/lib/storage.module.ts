/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { NestMinioModule, NestMinioOptions } from 'nestjs-minio';
import { Module } from '@nestjs/common';
import { ConfigurationModule, ConfigurationService } from '@h2-trust/configuration';
import { StorageService } from './storage.service';

@Module({
  imports: [
    ConfigurationModule,
    NestMinioModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: async (configService: ConfigurationService): Promise<NestMinioOptions> => ({
        endPoint: configService.getGlobalConfiguration().minio.endPoint,
        port: configService.getGlobalConfiguration().minio.port,
        useSSL: configService.getGlobalConfiguration().minio.useSSL,
        accessKey: configService.getGlobalConfiguration().minio.accessKey,
        secretKey: configService.getGlobalConfiguration().minio.secretKey,
      }),
    }),
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
