/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from 'express';
import { ZipFile } from 'yazl';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@h2-trust/storage';

@Injectable()
export class FileDownloadService {
  constructor(private readonly storage: StorageService) {}

  async downloadFilesAsZip(res: Response, fileNames: string[]) {
    const filesExist = await Promise.all(fileNames.map((f) => this.storage.fileExists(f)));
    const missingFiles = fileNames.filter((_, i) => !filesExist[i]);

    if (missingFiles.length > 0) {
      throw new NotFoundException(`Missing files: ${missingFiles.join(', ')}`);
    }

    const zip = new ZipFile();
    res.setHeader('Content-Type', 'application/zip');

    zip.outputStream.pipe(res);

    for (const file of fileNames) {
      const fileStream = await this.storage.downloadFile(file);
      zip.addReadStream(fileStream, file);
    }

    zip.end();
  }
}
