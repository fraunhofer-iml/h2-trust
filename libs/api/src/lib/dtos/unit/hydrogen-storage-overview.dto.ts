export class HydrogenStorageOverviewDto {
  id: string;
  name: string;
  capacity: number;
  filling: number;
  hydrogenProductionUnit: {
    id: string;
    name: string;
  };

  constructor(
    id: string,
    name: string,
    capacity: number,
    filling: number,
    hydrogenProductionUnit: {
      id: string;
      name: string;
    },
  ) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.filling = filling;
    this.hydrogenProductionUnit = hydrogenProductionUnit;
  }
}
