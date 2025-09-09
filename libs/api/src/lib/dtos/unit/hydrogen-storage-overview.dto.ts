import { HydrogenStorageUnitEntity } from '@h2-trust/amqp';
import { HydrogenComponentDto } from '../process-step';

export class HydrogenStorageOverviewDto {
  id: string;
  name: string;
  capacity: number;
  filling: number;
  hydrogenComposition: HydrogenComponentDto[];
  hydrogenProductionUnit: {
    id: string;
    name: string;
  };

  constructor(
    id: string,
    name: string,
    capacity: number,
    filling: number,
    hydrogenComposition: HydrogenComponentDto[],
    hydrogenProductionUnit: {
      id: string;
      name: string;
    },
  ) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.filling = filling;
    this.hydrogenComposition = hydrogenComposition;
    this.hydrogenProductionUnit = hydrogenProductionUnit;
  }

  static fromEntity(unit: HydrogenStorageUnitEntity): HydrogenStorageOverviewDto {
    return <HydrogenStorageOverviewDto>{
      id: unit.id,
      name: unit.name,
      capacity: unit.capacity,
      filling: HydrogenStorageOverviewDto.mapFilling(unit),
      hydrogenComposition: HydrogenStorageOverviewDto.mapHydrogenComposition(unit),
      hydrogenProductionUnit: HydrogenStorageOverviewDto.mapHydrogenProductionUnit(unit),
    };
  }

  private static mapFilling(unit: HydrogenStorageUnitEntity): number {
    return (
      unit.filling?.reduce((sum, filling) => {
        if (filling.amount == null) {
          throw new Error('One or more filling amounts are undefined');
        }
        return sum + filling.amount;
      }, 0) ?? 0
    );
  }

  private static mapHydrogenComposition(unit: HydrogenStorageUnitEntity): HydrogenComponentDto[] {
    const compositionMap = new Map<string, number>();
    unit.filling?.forEach((filling: HydrogenComponentDto) => {
      if (filling.color == null || filling.amount == null) {
        throw new Error('One or more fillings contain undefined values.');
      }
      compositionMap.set(filling.color, (compositionMap.get(filling.color) ?? 0) + filling.amount);
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
