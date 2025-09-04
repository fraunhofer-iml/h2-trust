import { CalculationTopic } from '../../enums';

export class EmissionCalculationDto {
  name: string;
  basisOfCalculation: string;
  result: number;
  unit: string;
  calculationTopic: CalculationTopic;

  constructor(
    name: string,
    basisOfCalculation: string,
    result: number,
    unit: string,
    calculationTopic: CalculationTopic,
  ) {
    this.name = name;
    this.basisOfCalculation = basisOfCalculation;
    this.result = result;
    this.unit = unit;
    this.calculationTopic = calculationTopic;
  }
}
