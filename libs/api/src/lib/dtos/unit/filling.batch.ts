// TODO-MP: rename to FillingBatchDto and rename file to filling-batch.dto.ts
export class FillingBatch {
  id: string;
  quantity: number;

  constructor(id: string, quantity: number) {
    this.id = id;
    this.quantity = quantity;
  }
}
