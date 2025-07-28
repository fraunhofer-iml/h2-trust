export class EmissionDto {
  amount: number;
  savingsPotential: number;
  calculation: string;

  constructor(amount: number, savingsPotential: number, calculation: string) {
    this.amount = amount;
    this.savingsPotential = savingsPotential;
    this.calculation = calculation;
  }
}
