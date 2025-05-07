;
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ProcessStepDbType } from '@h2-trust/database';
import { BatchEntity } from '../batch';
import { DocumentEntity } from '../document';


export class ProcessStepEntity {
  id?: string;
  startedAt: Date;
  endedAt: Date;
  processTypeName?: string;
  batch?: BatchEntity | null;
  userId?: string;
  unitId?: string;
  documents?: DocumentEntity[];

  constructor(
    id: string,
    startedAt: Date,
    endedAt: Date,
    processTypeName: string,
    batch: BatchEntity | null,
    userId: string,
    unitId: string,
    documents: DocumentEntity[],
  ) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.processTypeName = processTypeName;
    this.batch = batch;
    this.userId = userId;
    this.unitId = unitId;
    this.documents = documents;
  }

  static fromDatabase(processStep: ProcessStepDbType): ProcessStepEntity {
    return <ProcessStepEntity>{
      id: processStep.id,
      startedAt: processStep.startedAt,
      endedAt: processStep.endedAt,
      processTypeName: processStep.processTypeName,
      batch: BatchEntity.fromDatabase(processStep.batch),
      userId: processStep.userId,
      unitId: processStep.unitId,
      documents: processStep.documents.map(DocumentEntity.fromDatabase),
    };
  }
}
