export class FillingBatchDto {
  id: string;
  amount: number;

  constructor(id: string, amount: number) {
    this.id = id;
    this.amount = amount;
  }
}
