import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PowerAccessApprovalEntity, PowerAccessApprovalPattern } from '@h2-trust/amqp';
import { PowerAccessApprovalStatus } from '@h2-trust/api';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Controller()
export class PowerAccessApprovalController {
  constructor(private readonly service: PowerAccessApprovalService) {}

  @MessagePattern(PowerAccessApprovalPattern.READ)
  async findAll(
    @Payload() payload: { userId: string; powerAccessApprovalStatus: PowerAccessApprovalStatus },
  ): Promise<PowerAccessApprovalEntity[]> {
    return this.service.findAll(payload.userId, payload.powerAccessApprovalStatus);
  }
}
