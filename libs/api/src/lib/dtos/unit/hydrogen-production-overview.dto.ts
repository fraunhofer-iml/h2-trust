export class HydrogenProductionOverviewDto {
  id: string;
  name: string;
  ratedPower: number;
  typeName: string;
  producing: boolean;
  powerAccessApprovalStatus: boolean;
  hydrogenStorageUnit: {
    id: string;
    name: string;
  };

  constructor(
    id: string,
    name: string,
    ratedPower: number,
    typeName: string,
    producing: boolean,
    powerAccessApprovalStatus: boolean,
    hydrogenStorageUnit: {
      id: string;
      name: string;
    },
  ) {
    this.id = id;
    this.name = name;
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.producing = producing;
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
  }
}
