/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { StorageModule } from '@h2-trust/storage';
import { FileDownloadController } from './file-download.controller';
import { FileDownloadService } from './file-download.service';

@Module({
  imports: [StorageModule],
  controllers: [FileDownloadController],
  providers: [FileDownloadService],
})
export class FileDownloadModule {}
