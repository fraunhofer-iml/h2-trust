/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PassThrough, Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { CentralizedStorageService } from '@h2-trust/storage';
import { FileDownloadService } from './file-download.service';

jest.mock('node:stream/promises', () => ({
  pipeline: jest.fn(),
}));

const givenAddReadStream = jest.fn();
const givenEnd = jest.fn();
const givenOutputStream = new PassThrough();

jest.mock('yazl', () => ({
  ZipFile: jest.fn().mockImplementation(() => ({
    addReadStream: givenAddReadStream,
    end: givenEnd,
    outputStream: givenOutputStream,
  })),
}));

describe('FileDownloadService', () => {
  let service: FileDownloadService;

  const givenStorageMock = {
    fileExists: jest.fn(),
    downloadFile: jest.fn(),
  };

  const givenResponseMock = {
    setHeader: jest.fn(),
    status: jest.fn(),
    end: jest.fn(),
    headersSent: false,
  };

  beforeEach(() => {
    givenResponseMock.status.mockReturnValue(givenResponseMock);
    givenResponseMock.headersSent = false;

    service = new FileDownloadService(givenStorageMock as unknown as CentralizedStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw when at least one requested file is missing', async () => {
    // arrange
    givenStorageMock.fileExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    // act
    const actualResult = service.downloadFilesAsZip(givenResponseMock as unknown as Response, [
      'first.csv',
      'missing.csv',
    ]);

    // assert
    await expect(actualResult).rejects.toThrow(new NotFoundException('Missing files: missing.csv'));

    expect(givenStorageMock.downloadFile).not.toHaveBeenCalled();
    expect(pipeline).not.toHaveBeenCalled();
  });

  it('should add each file to the zip stream and pipe the archive to the response when all files exist', async () => {
    // arrange
    const givenFirstFileStream = Readable.from(['first']);
    const givenSecondFileStream = Readable.from(['second']);

    givenStorageMock.fileExists.mockResolvedValue(true);
    givenStorageMock.downloadFile
      .mockResolvedValueOnce(givenFirstFileStream)
      .mockResolvedValueOnce(givenSecondFileStream);
    jest.mocked(pipeline).mockResolvedValue(undefined);

    // act
    await service.downloadFilesAsZip(givenResponseMock as unknown as Response, ['first.csv', 'second.csv']);

    // assert
    expect(givenResponseMock.setHeader).toHaveBeenCalledWith('Content-Type', 'application/zip');
    expect(givenStorageMock.downloadFile).toHaveBeenNthCalledWith(1, 'first.csv');
    expect(givenStorageMock.downloadFile).toHaveBeenNthCalledWith(2, 'second.csv');
    expect(givenAddReadStream).toHaveBeenNthCalledWith(1, givenFirstFileStream, 'first.csv');
    expect(givenAddReadStream).toHaveBeenNthCalledWith(2, givenSecondFileStream, 'second.csv');
    expect(givenEnd).toHaveBeenCalledTimes(1);
    expect(pipeline).toHaveBeenCalledWith(givenOutputStream, givenResponseMock);
    expect(givenResponseMock.status).not.toHaveBeenCalled();
    expect(givenResponseMock.end).not.toHaveBeenCalled();
  });

  it('should return a 500 response when piping the zip fails before headers are sent', async () => {
    // arrange
    givenStorageMock.fileExists.mockResolvedValue(true);
    givenStorageMock.downloadFile.mockResolvedValue(Readable.from(['file']));
    jest.mocked(pipeline).mockRejectedValue(new Error('stream failed'));

    // act
    await service.downloadFilesAsZip(givenResponseMock as unknown as Response, ['first.csv']);

    // assert
    expect(givenResponseMock.status).toHaveBeenCalledWith(500);
    expect(givenResponseMock.end).toHaveBeenCalledTimes(1);
  });

  it('should not override the response when piping fails after headers were sent', async () => {
    // arrange
    givenStorageMock.fileExists.mockResolvedValue(true);
    givenStorageMock.downloadFile.mockResolvedValue(Readable.from(['file']));
    givenResponseMock.headersSent = true;
    jest.mocked(pipeline).mockRejectedValue(new Error('stream failed'));

    // act
    await service.downloadFilesAsZip(givenResponseMock as unknown as Response, ['first.csv']);

    // assert
    expect(givenResponseMock.status).not.toHaveBeenCalled();
    expect(givenResponseMock.end).not.toHaveBeenCalled();
  });
});
