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
import { ZipFile } from 'yazl';
import { CentralizedStorageService } from '@h2-trust/storage';
import { FileDownloadService } from './file-download.service';

jest.mock('node:stream/promises', () => ({
  pipeline: jest.fn(),
}));

const addReadStream = jest.fn();
const end = jest.fn();
const outputStream = new PassThrough();

jest.mock('yazl', () => ({
  ZipFile: jest.fn().mockImplementation(() => ({
    addReadStream,
    end,
    outputStream,
  })),
}));

describe('FileDownloadService', () => {
  let service: FileDownloadService;

  const storageMock = {
    fileExists: jest.fn(),
    downloadFile: jest.fn(),
  };

  const responseMock = {
    setHeader: jest.fn(),
    status: jest.fn(),
    end: jest.fn(),
    headersSent: false,
  };

  beforeEach(() => {
    responseMock.status.mockReturnValue(responseMock);
    responseMock.headersSent = false;

    service = new FileDownloadService(storageMock as unknown as CentralizedStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws when at least one requested file is missing', async () => {
    storageMock.fileExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(service.downloadFilesAsZip(responseMock as unknown as Response, ['first.csv', 'missing.csv'])).rejects.toThrow(
      new NotFoundException('Missing files: missing.csv'),
    );

    expect(storageMock.downloadFile).not.toHaveBeenCalled();
    expect(pipeline).not.toHaveBeenCalled();
  });

  it('adds each file to the zip stream and pipes the archive to the response', async () => {
    const firstFileStream = Readable.from(['first']);
    const secondFileStream = Readable.from(['second']);

    storageMock.fileExists.mockResolvedValue(true);
    storageMock.downloadFile.mockResolvedValueOnce(firstFileStream).mockResolvedValueOnce(secondFileStream);
    jest.mocked(pipeline).mockResolvedValue(undefined);

    await service.downloadFilesAsZip(responseMock as unknown as Response, ['first.csv', 'second.csv']);

    expect(responseMock.setHeader).toHaveBeenCalledWith('Content-Type', 'application/zip');
    expect(storageMock.downloadFile).toHaveBeenNthCalledWith(1, 'first.csv');
    expect(storageMock.downloadFile).toHaveBeenNthCalledWith(2, 'second.csv');
    expect(addReadStream).toHaveBeenNthCalledWith(1, firstFileStream, 'first.csv');
    expect(addReadStream).toHaveBeenNthCalledWith(2, secondFileStream, 'second.csv');
    expect(end).toHaveBeenCalledTimes(1);
    expect(pipeline).toHaveBeenCalledWith(outputStream, responseMock);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.end).not.toHaveBeenCalled();
  });

  it('returns a 500 response when piping the zip fails before headers are sent', async () => {
    storageMock.fileExists.mockResolvedValue(true);
    storageMock.downloadFile.mockResolvedValue(Readable.from(['file']));
    jest.mocked(pipeline).mockRejectedValue(new Error('stream failed'));

    await service.downloadFilesAsZip(responseMock as unknown as Response, ['first.csv']);

    expect(responseMock.status).toHaveBeenCalledWith(500);
    expect(responseMock.end).toHaveBeenCalledTimes(1);
  });

  it('does not override the response when piping fails after headers were sent', async () => {
    storageMock.fileExists.mockResolvedValue(true);
    storageMock.downloadFile.mockResolvedValue(Readable.from(['file']));
    responseMock.headersSent = true;
    jest.mocked(pipeline).mockRejectedValue(new Error('stream failed'));

    await service.downloadFilesAsZip(responseMock as unknown as Response, ['first.csv']);

    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.end).not.toHaveBeenCalled();
  });

  expect(ZipFile).toBeDefined();
});