export class PowerProductionUnitTypeEntity {
  name: string;
  energySource: string;
  hydrogenColor: string;

  constructor(name: string, energySource: string, hydrogenColor: string) {
    this.name = name;
    this.energySource = energySource;
    this.hydrogenColor = hydrogenColor;
  }
}
