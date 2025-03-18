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
      useFactory: async (configService: ConfigurationService): Promise<NestMinioOptions> => {
        const globalConfiguration = configService.getGlobalConfiguration();

        if (!globalConfiguration) {
          throw new Error('GeneralConfiguration is not defined.');
        }

        return {
          endPoint: globalConfiguration.minio.endPoint,
          port: globalConfiguration.minio.port,
          useSSL: globalConfiguration.minio.useSSL,
          accessKey: globalConfiguration.minio.accessKey,
          secretKey: globalConfiguration.minio.secretKey,
        };
      },
      inject: [ConfigurationService],
    }),
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
