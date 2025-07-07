import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';
import { FillingDto } from './filling.dto';

export class HydrogenStorageUnitDto extends BaseUnitDto {
  capacity: number;
  filling: FillingDto[];
  hydrogenProductionUnits: {
    id: string;
    name: string;
    hydrogenStorageUnitId: string;
  }[];

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
      hydrogenApprovals: {
        powerAccessApprovalStatus: string;
        powerProducerId: string;
      }[];
    },
    capacity: number,
    filling: FillingDto[],
    hydrogenProductionUnits: {
      id: string;
      name: string;
      hydrogenStorageUnitId: string;
    }[],
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
    this.capacity = capacity;
    this.filling = filling;
    this.hydrogenProductionUnits = hydrogenProductionUnits;
  }
}
