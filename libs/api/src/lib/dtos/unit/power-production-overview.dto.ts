import { PowerProductionUnitEntity } from '@h2-trust/amqp';

export class PowerProductionOverviewDto {
  id: string;
  name: string;
  ratedPower: number;
  typeName: string | undefined;
  producing: boolean;

  constructor(id: string, name: string, ratedPower: number, typeName: string, producing: boolean) {
    this.id = id;
    this.name = name;
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.producing = producing;
  }

  static fromEntity(unit: PowerProductionUnitEntity): PowerProductionOverviewDto {
    return <PowerProductionOverviewDto>{
      id: unit.id,
      name: unit.name,
      ratedPower: unit.ratedPower,
      typeName: unit.type?.name,
      producing: true,
    };
  }
}
