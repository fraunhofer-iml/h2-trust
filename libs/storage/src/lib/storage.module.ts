/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ConfigurationModule, ConfigurationService } from '@h2-trust/configuration';
import { CentralizedStorageService } from './centralized/centralized-storage.service';
import { DecentralizedStorageService } from './decentralized/decentralized-storage.service';
import { createCentralizedStorageService, createDecentralizedStorageService } from './storage.factory';

@Module({
  imports: [ConfigurationModule],
  providers: [
    {
      provide: CentralizedStorageService,
      inject: [ConfigurationService],
      useFactory: createCentralizedStorageService,
    },
    {
      provide: DecentralizedStorageService,
      inject: [ConfigurationService],
      useFactory: createDecentralizedStorageService,
    },
  ],
  exports: [CentralizedStorageService, DecentralizedStorageService],
})
export class StorageModule {}
