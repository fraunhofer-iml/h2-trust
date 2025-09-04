export class EmissionDto {
  amountCO2: number;
  amountCO2PerKgH2: number;
  basisOfCalculation: string;

  constructor(amountCO2: number, amountCO2PerKgH2: number, basisOfCalculation: string) {
    this.amountCO2 = amountCO2;
    this.amountCO2PerKgH2 = amountCO2PerKgH2;
    this.basisOfCalculation = basisOfCalculation;
  }
}
