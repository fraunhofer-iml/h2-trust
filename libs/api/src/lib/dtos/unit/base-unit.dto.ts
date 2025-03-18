import { AddressDto } from '../other';

export abstract class BaseUnitDto {
  id: string;
  name: string;
  mastrNumber: string;
  manufacturer: string;
  modelType: string;
  serialNumber: string;
  commissionedOn: Date;
  decommissioningPlannedOn: Date;
  address: AddressDto;

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
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.serialNumber = serialNumber;
    this.commissionedOn = commissionedOn;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.address = address;
  }
}
