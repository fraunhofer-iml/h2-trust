import { PowerAccessApprovalSeed } from 'libs/database/src/seed';
import { CompanyEntityHydrogenMock, CompanyEntityPowerMock } from '../../company';
import { DocumentEntityMock } from '../../document';
import { PowerProductionUnitEntityMock } from '../../unit';
import { PowerAccessApprovalEntity } from '../power-access-approval.entity';

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
