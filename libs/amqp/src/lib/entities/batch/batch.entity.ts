import { BatchDbType } from '@h2-trust/database';
import { CompanyEntity } from '../company';

export class BatchEntity {
  id?: string;
  active?: boolean;
  amount?: number;
  quality?: string;
  type?: string;
  predecessors?: BatchEntity[];
  successors?: BatchEntity[];
  owner?: CompanyEntity;
  hydrogenStorageUnitId?: string | null;

  constructor(
    id: string,
    active: boolean,
    amount: number,
    quality: string,
    type: string,
    predecessors: BatchEntity[],
    successors: BatchEntity[],
    owner: CompanyEntity,
    hydrogenStorageUnitId: string | null,
  ) {
    this.id = id;
    this.active = active;
    this.amount = amount;
    this.quality = quality;
    this.type = type;
    this.predecessors = predecessors;
    this.successors = successors;
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
      predecessors: batch.predecessors.map((pred) =>
        BatchEntity.fromDatabase({ ...pred, predecessors: [], successors: [] }),
      ),
      successors: batch.successors.map((succ) =>
        BatchEntity.fromDatabase({ ...succ, predecessors: [], successors: [] }),
      ),
      owner: CompanyEntity.fromDatabase(batch.owner),
      hydrogenStorageUnitId: batch.hydrogenStorageUnitId,
    };
  }
}
