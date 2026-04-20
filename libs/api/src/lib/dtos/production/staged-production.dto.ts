import { CsvContentType } from '../../types';

export class StagedProductionDto {
  id: string;
  startedAt: Date;
  endedAt: Date;
  amountProduced: number;
  csvContentType: CsvContentType;
  uploadedBy: string; // company name
  productionUnitId: string;
  amountConsumed?: number; // amount of power consumed, only set if csv content type is hydrogen

  constructor(
    id: string,
    startedAt: Date,
    endedAt: Date,
    amountProduced: number,
    csvContentType: CsvContentType,
    uploadedBy: string,
    productionUnitId: string,
    amountConsumed?: number,
  ) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.amountProduced = amountProduced;
    this.csvContentType = csvContentType;
    this.uploadedBy = uploadedBy;
    this.productionUnitId = productionUnitId;
    this.amountConsumed = amountConsumed;
  }
}
