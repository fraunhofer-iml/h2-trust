import { Response } from 'express';
import { ZipFile } from 'yazl';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '@h2-trust/storage';

@Injectable()
export class FileDownloadService {
  constructor(private readonly storage: StorageService) {}

  async downloadFilesAsZip(res: Response, files: string[]) {
    const missing: string[] = [];
    for (const file of files) {
      const exists = await this.storage.checkFIleExists(file);
      if (!exists) {
        missing.push(file);
      }
    }

    if (missing.length > 0) {
      throw new NotFoundException(`Missing files: ${missing.join(', ')}`);
    }

    const zip = new ZipFile();
    res.setHeader('Content-Type', 'application/zip');

    zip.outputStream.pipe(res);

    for (const file of files) {
      const fileStream = await this.storage.downloadFile(file);
      zip.addReadStream(fileStream, file);
    }

    zip.end();
  }
}
