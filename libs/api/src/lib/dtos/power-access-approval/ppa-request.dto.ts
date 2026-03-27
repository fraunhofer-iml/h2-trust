import { PowerAccessApprovalStatus, PowerType } from '@h2-trust/domain';
import { PowerProductionOverviewDto } from '../unit';
import { UserDetailsDto } from '../user';

export class PpaRequestDto {
  id: string;
  timestamp: string;
  sender: UserDetailsDto;
  receiver: UserDetailsDto;
  powerType: PowerType;
  powerProductionUnit?: PowerProductionOverviewDto;
  status: PowerAccessApprovalStatus;
  comment?: string;

  constructor(
    id: string,
    timestammp: string,
    sender: UserDetailsDto,
    receiver: UserDetailsDto,
    powerType: PowerType,
    powerProductionUnit: PowerProductionOverviewDto,
    status: PowerAccessApprovalStatus,
    comment?: string,
  ) {
    this.id = id;
    this.timestamp = timestammp;
    this.sender = sender;
    this.receiver = receiver;
    this.powerType = powerType;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.comment = comment;
  }
}
