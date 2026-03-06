export class ProductionDataFilter {
  pageNumber?: number;
  pageSize?: number;
  hydrogenProductionUnitId?: string;
  period?: Date;

  constructor(pageNumber?: number, pageSize?: number, hydrogenProductionUnitId?: string, period?: Date) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.period = period;
  }
}
