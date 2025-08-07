export class FileInfoDto {
  description: string;
  url: string;

  constructor(description: string, url: string) {
    this.description = description;
    this.url = url;
  }
}
