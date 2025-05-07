import { CompanyDto } from '../company';

export class BatchDto {
  id?: string;
  active?: boolean;
  amount: number;
  quality?: string;
  type?: string;
  owner?: CompanyDto;
  hydrogenStorageUnitId?: string | null;

  constructor(
    id: string,
    active: boolean,
    amount: number,
    quality: string,
    type: string,
    owner: CompanyDto,
    hydrogenStorageUnitId: string,
  ) {
    this.id = id;
    this.active = active;
    this.amount = amount;
    this.quality = quality;
    this.type = type;
    this.owner = owner;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
  }

}
