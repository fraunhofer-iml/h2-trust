import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export class DecisionDto {
  id: string;
  status: PowerPurchaseAgreementStatus;
  decidedAt: Date;
  comment: string;
  powerProductionUnitId: string;
  authorizingUser: string;
  grantedPowerProductionUnitId: string;

  constructor(
    id: string,
    status: PowerPurchaseAgreementStatus,
    decidedAt: Date,
    comment: string,
    powerProductionUnitId: string,
    authorizingUser: string,
    grantedPowerProductionUnitId: string,
  ) {
    this.id = id;
    this.status = status;
    this.decidedAt = decidedAt;
    this.comment = comment;
    this.powerProductionUnitId = powerProductionUnitId;
    this.authorizingUser = authorizingUser;
    this.grantedPowerProductionUnitId = grantedPowerProductionUnitId;
  }
}
