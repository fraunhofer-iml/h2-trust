import { Injectable } from '@nestjs/common';
import { PowerAccessApprovalDto, PowerAccessApprovalDtoMock, PowerAccessApprovalStatus } from '@h2-trust/api';

@Injectable()
export class PowerAccessApprovalService {
  findAll(_id: string, _status: PowerAccessApprovalStatus): PowerAccessApprovalDto[] {
    return PowerAccessApprovalDtoMock;
  }
}
