import { HydrogenStorageUnitEntity } from '@h2-trust/amqp';

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

  static fromEntity(unit: HydrogenStorageUnitEntity): HydrogenStorageOverviewDto {
    return <HydrogenStorageOverviewDto>{
      id: unit.id,
      name: unit.name,
      capacity: unit.capacity,
      filling: HydrogenStorageOverviewDto.mapFilling(unit),
      hydrogenProductionUnit: HydrogenStorageOverviewDto.mapHydrogenProductionUnit(unit),
    };
  }

  private static mapFilling(unit: HydrogenStorageUnitEntity): number {
    return unit.filling?.map((filling) => filling.quantity).reduce((total, value) => total + value, 0) ?? 0;
  }

  private static mapHydrogenProductionUnit(unit: HydrogenStorageUnitEntity) {
    return unit.hydrogenProductionUnits
      ?.filter((unit) => unit.hydrogenStorageUnitId === unit.id)
      .map((unit) => ({
        id: unit.id,
        name: unit.name,
      }))[0];
  }
}
