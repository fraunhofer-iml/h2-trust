export class PowerAccessApprovalConnectionDto {
  powerAccessApprovalStatus: string;
  powerProducerId: string;

  constructor(powerAccessApprovalStatus: string, powerProducerId: string) {
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
    this.powerProducerId = powerProducerId;
  }
}
