/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { StorageModule } from '@h2-trust/storage';
import { FileDownloadController } from './file-download.controller';
import { FileDownloadService } from './file-download.service';

describe('FileDownloadController', () => {
  let controller: FileDownloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
      controllers: [FileDownloadController],
      providers: [FileDownloadService],
    }).compile();

    controller = module.get<FileDownloadController>(FileDownloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
