export class CreateBottleBatchDto {
  quantity: string;
  timestamp: string;
  removedFromStorageUnit: string;
  recipientId: string;
  file: FormData[];

  constructor(
    quantity: string,
    timestamp: string,
    removedFromStorageUnit: string,
    recipientId: string,
    file: FormData[],
  ) {
    this.quantity = quantity;
    this.timestamp = timestamp;
    this.removedFromStorageUnit = removedFromStorageUnit;
    this.recipientId = recipientId;
    this.file = file;
  }
}
