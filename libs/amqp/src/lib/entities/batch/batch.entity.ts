// eslint-disable-next-line @nx/enforce-module-boundaries
import { BatchDbType } from '@h2-trust/database';
import { CompanyEntity } from '../company';

export class BatchEntity {
  id?: string;
  active?: boolean;
  amount: number;
  quality: string;
  type: string;
  owner?: CompanyEntity;
  hydrogenStorageUnitId?: string | null;

  constructor(
    id: string,
    active: boolean,
    amount: number,
    quality: string,
    type: string,
    owner: CompanyEntity,
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

  static fromDatabase(batch: BatchDbType): BatchEntity {
    return <BatchEntity>{
      id: batch.id,
      active: batch.active,
      amount: batch.amount.toNumber(),
      quality: batch.quality,
      type: batch.type,
      owner: {
        id: batch.owner.id,
        name: batch.owner.name,
        mastrNumber: batch.owner.mastrNumber,
        companyType: batch.owner.companyType,
      },
      hydrogenStorageUnitId: batch.hydrogenStorageUnitId,
    };
  }
}
