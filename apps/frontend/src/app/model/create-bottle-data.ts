import { BottlingDto, FGFile } from '@h2-trust/api';

export class CreateBottleData {
  bottle: BottlingDto;
  files: FGFile[];

  constructor(bottle: BottlingDto, files: FGFile[]) {
    this.bottle = bottle;
    this.files = files;
  }
}
