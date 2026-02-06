import { IsArray, IsNotEmpty } from 'class-validator';

export class DownloadFilesDto {
  @IsNotEmpty()
  @IsArray()
  ids: string[];

  constructor(ids: string[]) {
    this.ids = ids;
  }
}
