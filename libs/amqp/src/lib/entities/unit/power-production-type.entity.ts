import { PowerProductionTypeDbType } from '@h2-trust/database';

export class PowerProductionTypeEntity {
  name: string;
  energySource: string;
  hydrogenColor: string;

  constructor(name: string, energySource: string, hydrogenColor: string) {
    this.name = name;
    this.energySource = energySource;
    this.hydrogenColor = hydrogenColor;
  }

  static fromDatabase(powerProductionUnitDbType: PowerProductionTypeDbType): PowerProductionTypeEntity {
    return <PowerProductionTypeEntity>{
      name: powerProductionUnitDbType.name,
      energySource: powerProductionUnitDbType.energySource,
      hydrogenColor: powerProductionUnitDbType.hydrogenColor,
    };
  }
}
