export class WaterDetailsDto {
  amount: number;
  emission: number;
  emissionCalculation: string;

  constructor(amount: number, emission: number, emissionCalculation: string) {
    this.amount = amount;
    this.emission = emission;
    this.emissionCalculation = emissionCalculation;
  }
}
