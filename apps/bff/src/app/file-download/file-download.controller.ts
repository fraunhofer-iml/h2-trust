import type { Response } from 'express';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { DownloadFilesDto } from '@h2-trust/api';
import { FileDownloadService } from './file-download.service';

@Controller('file-download')
export class FileDownloadController {
  constructor(private readonly fileDownloadService: FileDownloadService) {}

  @Post()
  findAll(@Body() dto: DownloadFilesDto, @Res() res: Response) {
    return this.fileDownloadService.downloadItemsAsZip(dto.ids, res);
  }
}
