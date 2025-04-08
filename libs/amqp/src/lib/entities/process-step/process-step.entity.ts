// eslint-disable-next-line @nx/enforce-module-boundaries
import { ProcessStepDbType } from '@h2-trust/database';
import { BatchEntity } from '../batch';

export class ProcessStepEntity {
  id: string;
  timestamp: Date;
  processTypeName: string;
  batch?: BatchEntity | null;
  userId: string;

  constructor(id: string, timestamp: Date, processTypeName: string, batch: BatchEntity, userId: string) {
    this.id = id;
    this.timestamp = timestamp;
    this.processTypeName = processTypeName;
    this.batch = batch;
    this.userId = userId;
  }

  static fromDatabase(processStep: ProcessStepDbType): ProcessStepEntity {
    return <ProcessStepEntity>{
      id: processStep.id,
      timestamp: processStep.timestamp,
      processTypeName: processStep.processTypeName,
      batch: {
        id: processStep.batch.id,
        active: processStep.batch.active,
        quantity: processStep.batch.quantity.toNumber(),
        quality: processStep.batch.quality,
        type: processStep.batch.type,
        owner: {
          id: processStep.batch.owner.id,
          name: processStep.batch.owner.name,
          mastrNumber: processStep.batch.owner.mastrNumber,
          companyType: processStep.batch.owner.companyType,
        },
        hydrogenStorageUnitId: processStep.batch.hydrogenStorageUnitId,
      },
      userId: processStep.userId,
    };
  }
}
