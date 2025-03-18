import { AddressDto } from '../other';
import { BaseUnitDto } from './base-unit.dto';

export class HydrogenProductionUnitDto extends BaseUnitDto {
  ratedPower: number;
  typeName: string;
  hydrogenStorageUnitId: string;

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
    typeName: string,
    hydrogenStorageUnitId: string,
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
    this.typeName = typeName;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
  }
}
