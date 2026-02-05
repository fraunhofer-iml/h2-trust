import { Module } from '@nestjs/common';
import { StorageModule } from '@h2-trust/storage';
import { FileDownloadController } from './file-download.controller';
import { FileDownloadService } from './file-download.service';

@Module({
  imports: [StorageModule],
  controllers: [FileDownloadController],
  providers: [FileDownloadService],
})
export class FileDownloadModule {}
