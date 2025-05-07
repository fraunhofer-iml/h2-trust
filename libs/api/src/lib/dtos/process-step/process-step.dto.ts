import { DocumentEntity } from '@h2-trust/amqp';
import { BatchDto } from '../batch';

export class ProcessStepDto {
  id?: string;
  startedAt: Date;
  endedAt: Date;
  processTypeName?: string;
  batch?: BatchDto | null;
  userId?: string;
  unitId?: string;
  documents?: DocumentEntity[];

  constructor(id: string, startedAt: Date, endedAt: Date, processTypeName: string, batch: BatchDto | null, userId: string, unitId: string, documents: DocumentEntity[]) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.processTypeName = processTypeName;
    this.batch = batch;
    this.userId = userId;
    this.unitId = unitId;
    this.documents = documents;
  }
}
