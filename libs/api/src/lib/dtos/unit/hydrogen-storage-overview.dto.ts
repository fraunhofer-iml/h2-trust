import { FillingEntity, HydrogenStorageUnitEntity } from '@h2-trust/amqp';
import { HydrogenCompositionDto } from '../process-step';

export class HydrogenStorageOverviewDto {
  id: string;
  name: string;
  capacity: number;
  filling: number;
  hydrogenProductionUnit: {
    id: string;
    name: string;
  };
  hydrogenCompositions: HydrogenCompositionDto[];

  constructor(
    id: string,
    name: string,
    capacity: number,
    filling: number,
    hydrogenCompositions: HydrogenCompositionDto[],
    hydrogenProductionUnit: {
      id: string;
      name: string;
    },
    hydrogenComposition: HydrogenCompositionDto[],
  ) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.filling = filling;
    this.hydrogenCompositions = hydrogenCompositions;
    this.hydrogenProductionUnit = hydrogenProductionUnit;
    this.hydrogenCompositions = hydrogenComposition;
  }

  static fromEntity(unit: HydrogenStorageUnitEntity): HydrogenStorageOverviewDto {
    return <HydrogenStorageOverviewDto>{
      id: unit.id,
      name: unit.name,
      capacity: unit.capacity,
      filling: HydrogenStorageOverviewDto.mapFilling(unit),
      hydrogenCompositions: HydrogenStorageOverviewDto.mapHydrogenCompositions(unit),
      hydrogenProductionUnit: HydrogenStorageOverviewDto.mapHydrogenProductionUnit(unit),
    };
  }

  private static mapFilling(unit: HydrogenStorageUnitEntity): number {
    return unit.filling?.map((filling) => filling.amount).reduce((total, value) => total + value, 0) ?? 0;
  }

  private static mapHydrogenCompositions(unit: HydrogenStorageUnitEntity): HydrogenCompositionDto[] {
    const compositionMap = new Map<string, number>();
    unit.filling.forEach((batch: FillingEntity) => {
      compositionMap.set(batch.color, (compositionMap.get(batch.color) ?? 0) + batch.amount);
    });
    return Array.from(compositionMap, ([color, amount]) => ({
      color,
      amount,
    }));
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
