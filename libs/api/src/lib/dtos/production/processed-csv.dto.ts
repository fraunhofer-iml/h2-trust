import { CsvContentType } from '../../types';

export class ProcessedCsvDto {
  id: string;
  url: string;
  name: string;
  uploadedBy: string; // company name
  startedAt: Date;
  endedAt: Date;
  csvContentType: CsvContentType;
  amount: number;

  // TODO: add amount
  constructor(
    id: string,
    url: string,
    name: string,
    uploadedBy: string,
    startedAt: Date,
    endedAt: Date,
    csvContentType: CsvContentType,
    amount: number,
  ) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.uploadedBy = uploadedBy;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.csvContentType = csvContentType;
    this.amount = amount;
  }
}
