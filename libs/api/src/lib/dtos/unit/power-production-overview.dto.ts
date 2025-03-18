export class PowerProductionOverviewDto {
  id: string;
  name: string;
  ratedPower: number;
  typeName: string;
  producing: boolean;

  constructor(id: string, name: string, ratedPower: number, typeName: string, producing: boolean) {
    this.id = id;
    this.name = name;
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.producing = producing;
  }
}
