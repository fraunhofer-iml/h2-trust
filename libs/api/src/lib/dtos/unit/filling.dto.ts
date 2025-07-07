export class FillingDto {
  id: string;
  color: string;
  amount: number;

  constructor(id: string, color: string, amount: number) {
    this.id = id;
    this.color = color;
    this.amount = amount;
  }
}
