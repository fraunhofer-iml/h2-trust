/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Response } from 'express';
import { DownloadFilesDtoFixture } from '@h2-trust/contracts/dtos/fixtures';
import { FileDownloadController } from './file-download.controller';
import { FileDownloadService } from './file-download.service';

describe('FileDownloadController', () => {
  let controller: FileDownloadController;

  const fileDownloadServiceMock = {
    downloadFilesAsZip: jest.fn(),
  };

  beforeEach(() => {
    controller = new FileDownloadController(fileDownloadServiceMock as unknown as FileDownloadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates the requested file ids and response to FileDownloadService', async () => {
    const dto = DownloadFilesDtoFixture.create({ ids: ['first.csv', 'second.csv'] });
    const response = {} as Response;

    fileDownloadServiceMock.downloadFilesAsZip.mockResolvedValue(undefined);

    await expect(controller.findAll(dto, response)).resolves.toBeUndefined();
    expect(fileDownloadServiceMock.downloadFilesAsZip).toHaveBeenCalledWith(response, dto.ids);
  });
});