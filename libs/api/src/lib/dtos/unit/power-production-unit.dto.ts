import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';
import { PowerProductionUnitTypeDto } from './power-production-unit-type.dto';

export class PowerProductionUnitDto extends BaseUnitDto {
  ratedPower: number;
  gridOperator: string;
  gridLevel: string;
  gridConnectionNumber: string;
  type: PowerProductionUnitTypeDto;

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
    company: {
      id: string;
      hydrogenApprovals: { powerAccessApprovalStatus: string; powerProducerId: string }[];
    },
    ratedPower: number,
    gridOperator: string,
    gridLevel: string,
    gridConnectionNumber: string,
    type: PowerProductionUnitTypeDto,
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
      company,
    );
    this.ratedPower = ratedPower;
    this.gridOperator = gridOperator;
    this.gridLevel = gridLevel;
    this.gridConnectionNumber = gridConnectionNumber;
    this.type = type;
  }
}
