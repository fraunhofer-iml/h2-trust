import { Decision } from '@prisma/client';
import { auditTimestamp } from './audit-timestamp.constant';
import { PowerPurchaseAgreementSeed } from './power-purchase-agreement.seed';
import { PowerProductionUnitSeed } from './unit';
import { UserSeed } from './user.seed';

export const DecisionSeed: readonly Decision[] = Object.freeze([
  {
    id: 'decision-1',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[0].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: PowerProductionUnitSeed[0].id,
  },
  {
    id: 'decision-2',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[1].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: PowerProductionUnitSeed[1].id,
  },
  {
    id: 'decision-3',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[2].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: PowerProductionUnitSeed[2].id,
  },
  {
    id: 'decision-4',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[3].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: PowerProductionUnitSeed[3].id,
  },
]);
