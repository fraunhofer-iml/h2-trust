import { PowerAccessApprovalSeed } from 'libs/database/src/seed';
import { PowerAccessApprovalEntity } from '../power-access-approval.entity';
import { CompanyEntityHydrogenMock, CompanyEntityPowerMock } from '../../company';
import { PowerProductionUnitEntityMock } from '../../unit';
import { DocumentEntityMock } from '../../document';

export const PowerAccessApprovalEntityMock: PowerAccessApprovalEntity[] = PowerAccessApprovalSeed.map(
  (seed) =>
    new PowerAccessApprovalEntity(
      seed.id,
      seed.decidedAt,
      seed.powerAccessApprovalStatus,
      CompanyEntityPowerMock,
      PowerProductionUnitEntityMock[0], 
      CompanyEntityHydrogenMock,
      DocumentEntityMock[0],
    ),
);
