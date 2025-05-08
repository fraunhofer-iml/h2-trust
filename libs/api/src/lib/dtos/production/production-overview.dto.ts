export class ProductionOverviewDto {
  startedOn: string;
  endedOn: string;
  productionUnit: string;
  producedAmount: number;
  color: string;
  powerProducer: string;
  powerConsumed: number;
  energySource: string;

  constructor(
    start: string,
    end: string,
    productionUnit: string,
    producedAmount: number,
    color: string,
    powerProducer: string,
    powerConsumed: number,
    energySource: string,
  ) {
    this.startedOn = start;
    this.endedOn = end;
    this.productionUnit = productionUnit;
    this.producedAmount = producedAmount;
    this.color = color;
    this.powerProducer = powerProducer;
    this.powerConsumed = powerConsumed;
    this.energySource = energySource;
  }
}
