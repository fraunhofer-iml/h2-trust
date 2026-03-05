export class ProductionDataFilter {
  page: number;
  hydrogenProductionUnitId: string;
  period: Date;

  constructor(page: number, hydrogenProductionUnitId: string, period: Date) {
    this.page = page;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.period = period;
  }
}
