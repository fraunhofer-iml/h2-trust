import { PowerAccessApprovalDbType } from 'libs/database/src/lib';
import { PowerAccessApprovalStatus } from '@prisma/client';
import { CompanyEntity } from '../company';
import { DocumentEntity } from '../document';
import { BaseUnitEntity, PowerProductionUnitEntity } from '../unit';

export class PowerAccessApprovalEntity {
  id: string;
  decidedAt: Date;
  status: PowerAccessApprovalStatus;
  powerProducer: CompanyEntity;
  powerProductionUnit: PowerProductionUnitEntity;
  hydrogenProducer: CompanyEntity;
  document: DocumentEntity;

  constructor(
    id: string,
    decidedAt: Date,
    status: PowerAccessApprovalStatus,
    powerProducer: CompanyEntity,
    powerProductionUnit: PowerProductionUnitEntity,
    hydrogenProducer: CompanyEntity,
    document: DocumentEntity,
  ) {
    this.id = id;
    this.decidedAt = decidedAt;
    this.status = status;
    this.powerProducer = powerProducer;
    this.powerProductionUnit = powerProductionUnit;
    this.hydrogenProducer = hydrogenProducer;
    this.document = document;
  }

  static fromDatabase(powerAccessApproval: PowerAccessApprovalDbType): PowerAccessApprovalEntity {
    return <PowerAccessApprovalEntity>{
      id: powerAccessApproval.id,
      decidedAt: powerAccessApproval.decidedAt,
      status: powerAccessApproval.powerAccessApprovalStatus,
      powerProducer: CompanyEntity.fromDatabase(powerAccessApproval.powerProducer),
      powerProductionUnit: {
        ...BaseUnitEntity.fromDatabase(powerAccessApproval.powerProductionUnit.generalInfo),
        ratedPower: powerAccessApproval.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
        gridOperator: powerAccessApproval.powerProductionUnit?.gridOperator,
        gridLevelName: powerAccessApproval.powerProductionUnit?.gridLevelName,
        gridConnectionNumber: powerAccessApproval.powerProductionUnit?.gridConnectionNumber,
        typeName: powerAccessApproval.powerProductionUnit?.type.name,
      },
      hydrogenProducer: CompanyEntity.fromDatabase(powerAccessApproval.powerProducer),
      document: DocumentEntity.fromDatabase(powerAccessApproval.document),
    };
  }
}
