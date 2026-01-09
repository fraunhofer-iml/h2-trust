import { PowerAccessApprovalConnectionDto } from './power-access-approval-connectopn.dto';

export class UnitOwnerDto {
  id: string;
  hydrogenApprovals: PowerAccessApprovalConnectionDto[];

  constructor(id: string, hydrogenApprovals: PowerAccessApprovalConnectionDto[]) {
    this.id = id;
    this.hydrogenApprovals = hydrogenApprovals;
  }
}
