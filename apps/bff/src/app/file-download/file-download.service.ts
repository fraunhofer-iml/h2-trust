import archiver, { Archiver } from 'archiver';
import { Response } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '@h2-trust/storage';

@Injectable()
export class FileDownloadService {
  private readonly logger: Logger = new Logger();
  constructor(private readonly storageService: StorageService) {}

  async downloadItemsAsZip(items: string[], res: Response) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; ');

    const archive: Archiver = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err: Error) => {
      this.logger.error(err.message);
      res.status(500).end();
    });

    archive.pipe(res);

    for (const item of items) {
      const stream = await this.storageService.downloadFile(item);
      archive.append(stream, { name: item });
    }

    archive.finalize();
  }
}
