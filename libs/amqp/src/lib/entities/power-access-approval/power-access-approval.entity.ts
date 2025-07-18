import { PowerAccessApprovalStatusDbEnum } from '@h2-trust/database';

export class PowerAccessApprovalEntity {
  id: string;
  decidedAt: Date;
  powerAccessApprovalStatus: PowerAccessApprovalStatusDbEnum;
  powerProducerId: string;
  powerProductionUnitId: string;
  hydrogenProducerId: string;
  documentId: string;

  constructor(
    id: string,
    decidedAt: Date,
    powerAccessApprovalStatus: PowerAccessApprovalStatusDbEnum,
    powerProducerId: string,
    powerProductionUnitId: string,
    hydrogenProducerId: string,
    documentId: string,
  ) {
    this.id = id;
    this.decidedAt = decidedAt;
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
    this.powerProducerId = powerProducerId;
    this.powerProductionUnitId = powerProductionUnitId;
    this.hydrogenProducerId = hydrogenProducerId;
    this.documentId = documentId;
  }
}
