import { PowerAccessApprovalSeed } from 'libs/database/src/seed';
import { PowerAccessApprovalEntity } from '../power-access-approval.entity';

export const PowerAccessApprovalEntityMock: PowerAccessApprovalEntity[] = PowerAccessApprovalSeed.map(
  (seed) =>
    new PowerAccessApprovalEntity(
      seed.id,
      seed.decidedAt,
      seed.powerAccessApprovalStatus,
      seed.powerProducerId,
      seed.powerProductionUnitId,
      seed.hydrogenProducerId,
      seed.documentId,
    ),
);
