/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { pipeline } from 'node:stream/promises';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { ZipFile } from 'yazl';
import { CentralizedStorageService } from '@h2-trust/storage';

@Injectable()
export class FileDownloadService {
  constructor(private readonly storage: CentralizedStorageService) {}

  async downloadFilesAsZip(res: Response, fileNames: string[]): Promise<void> {
    const filesExist = await Promise.all(fileNames.map((f) => this.storage.fileExists(f)));
    const missingFiles = fileNames.filter((_, i) => !filesExist[i]);

    if (missingFiles.length > 0) {
      throw new NotFoundException(`Missing files: ${missingFiles.join(', ')}`);
    }

    const zip = new ZipFile();
    res.setHeader('Content-Type', 'application/zip');

    for (const file of fileNames) {
      const fileStream = await this.storage.downloadFile(file);
      zip.addReadStream(fileStream, file);
    }
    zip.end();

    try {
      await pipeline(zip.outputStream, res);
    } catch {
      if (!res.headersSent) {
        res.status(500).end();
      }
    }
  }
}
