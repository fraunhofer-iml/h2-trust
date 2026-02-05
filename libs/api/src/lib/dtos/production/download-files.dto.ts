import { IsArray, IsNotEmpty } from 'class-validator';

export class DownloadFilesDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  constructor(ids: string[]) {
    this.ids = ids;
  }
}
