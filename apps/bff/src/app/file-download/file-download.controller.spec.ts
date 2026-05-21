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

  it('should delegate the requested file ids and response to FileDownloadService when downloading files', async () => {
    // arrange
    const givenDto = DownloadFilesDtoFixture.create({ ids: ['first.csv', 'second.csv'] });
    const givenResponse = {} as Response;

    fileDownloadServiceMock.downloadFilesAsZip.mockResolvedValue(undefined);

    // act
    const actualResult = await controller.findAll(givenDto, givenResponse);

    // assert
    expect(actualResult).toBeUndefined();
    expect(fileDownloadServiceMock.downloadFilesAsZip).toHaveBeenCalledWith(givenResponse, givenDto.ids);
  });
});
