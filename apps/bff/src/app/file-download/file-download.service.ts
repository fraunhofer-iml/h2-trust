import { Response } from 'express';
import * as yazl from 'yazl';
import { Injectable } from '@nestjs/common';
import { StorageService } from '@h2-trust/storage';

@Injectable()
export class FileDownloadService {
  //private readonly logger: Logger = new Logger();
  constructor(private readonly storageService: StorageService) {}

  async createZipStream(items: string[], res: Response) {
    const fileList = items.map((f) => f.trim()).filter(Boolean);

    const zipfile = new yazl.ZipFile();

    // HTTP-Header setzen, bevor wir streamen
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="download.zip"');

    // ZIP-Output in die HTTP-Response streamen
    zipfile.outputStream.pipe(res).on('close', () => {
      // optional logging
    });

    // Dateien aus MinIO als Streams hinzufügen
    for (const filename of fileList) {
      const stream = await this.storageService.downloadFile(filename);

      // addReadStream erwartet u.a. filename im ZIP
      zipfile.addReadStream(stream, filename);
    }

    // ZIP finalisieren
    zipfile.end();
  }
}
