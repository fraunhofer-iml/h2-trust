import { Body, Controller, Post } from '@nestjs/common';
import { DownloadFilesDto } from '@h2-trust/api';

@Controller('file-download')
export class FileDownloadController {
  constructor() {}

  @Post()
  findAll(@Body() dto: DownloadFilesDto) {
    console.log(dto);
    return 'test';
  }
}
