import { AddressDto } from '../other';
import { BaseUnitDto } from './base-unit.dto';

export class PowerProductionUnitDto extends BaseUnitDto {
  ratedPower: number;
  gridOperator: string;
  gridLevel: string;
  gridConnectionNumber: string;
  typeName: string;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressDto,
    ratedPower: number,
    gridOperator: string,
    gridLevel: string,
    gridConnectionNumber: string,
    typeName: string,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      serialNumber,
      commissionedOn,
      decommissioningPlannedOn,
      address,
    );
    this.ratedPower = ratedPower;
    this.gridOperator = gridOperator;
    this.gridLevel = gridLevel;
    this.gridConnectionNumber = gridConnectionNumber;
    this.typeName = typeName;
  }
}
