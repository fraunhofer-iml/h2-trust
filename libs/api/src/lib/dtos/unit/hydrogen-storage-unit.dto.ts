import { AddressDto } from '../other';
import { BaseUnitDto } from './base-unit.dto';
import { FillingBatch } from './filling.batch';

export class HydrogenStorageUnitDto extends BaseUnitDto {
  capacity: number;
  filling: FillingBatch[];

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
    capacity: number,
    filling: FillingBatch[],
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
    this.capacity = capacity;
    this.filling = filling;
  }
}
