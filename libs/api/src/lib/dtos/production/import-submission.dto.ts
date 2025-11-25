export class ImportSubmissionDto {
  intervallSetId: string;
  storageUnitId: string;

  constructor(intervallSetId: string, storageUnitId: string) {
    this.intervallSetId = intervallSetId;
    this.storageUnitId = storageUnitId;
  }
}
