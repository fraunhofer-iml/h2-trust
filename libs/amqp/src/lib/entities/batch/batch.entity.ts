import { CompanyEntity } from '../company';

export class BatchEntity {
  id: string;
  active: boolean;
  quantity: number;
  quality: string;
  type: string;
  owner: CompanyEntity;
  hydrogenStorageUnitId: string | null;

  constructor(
    id: string,
    active: boolean,
    quantity: number,
    quality: string,
    type: string,
    owner: CompanyEntity,
    hydrogenStorageUnitId: string,
  ) {
    this.id = id;
    this.active = active;
    this.quantity = quantity;
    this.quality = quality;
    this.type = type;
    this.owner = owner;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
  }
}
