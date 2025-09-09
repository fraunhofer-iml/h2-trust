import { ProcessStepDbType } from '@h2-trust/database';
import { BatchEntity } from '../batch';
import { DocumentEntity } from '../document';
import { BaseUnitEntity } from '../unit';
import { UserEntity } from '../user';
import { TransportationDetailsEntity } from './transportation-details.entity';

export class ProcessStepEntity {
  id?: string;
  startedAt: Date;
  endedAt: Date;
  processType?: string;
  batch?: BatchEntity | null;
  recordedBy?: UserEntity;
  executedBy?: BaseUnitEntity;
  documents?: DocumentEntity[];
  transportationDetails?: TransportationDetailsEntity;

  constructor(
    id: string,
    startedAt: Date,
    endedAt: Date,
    processType: string,
    batch: BatchEntity | null,
    recordedBy: UserEntity,
    executedBy: BaseUnitEntity,
    documents: DocumentEntity[],
    transportationDetails?: TransportationDetailsEntity,
  ) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.processType = processType;
    this.batch = batch;
    this.recordedBy = recordedBy;
    this.executedBy = executedBy;
    this.documents = documents;
    this.transportationDetails = transportationDetails;
  }

  static fromDatabase(processStep: ProcessStepDbType): ProcessStepEntity {
    return <ProcessStepEntity>{
      id: processStep.id,
      startedAt: processStep.startedAt,
      endedAt: processStep.endedAt,
      processType: processStep.processTypeName,
      batch: BatchEntity.fromDatabase(processStep.batch),
      recordedBy: UserEntity.fromDatabase(processStep.recordedBy),
      executedBy: BaseUnitEntity.fromDatabase(processStep.executedBy),
      documents: processStep.documents.map(DocumentEntity.fromDatabase),
      transportationDetails: processStep.processStepDetails?.transportationDetails
        ? TransportationDetailsEntity.fromDatabase(processStep.processStepDetails.transportationDetails)
        : undefined,
    };
  }
}
