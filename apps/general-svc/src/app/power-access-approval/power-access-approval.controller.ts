import { Controller } from "@nestjs/common";
import { PowerAccessApprovalService } from "./power-access-approval.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { PowerAccessApprovalEntity, PowerAccessApprovalPattern } from "@h2-trust/amqp";
import { PowerAccessApprovalStatus } from '@h2-trust/api';


@Controller()
export class PowerAccessApprovalController {
  constructor(private readonly service: PowerAccessApprovalService) { }

  @MessagePattern(PowerAccessApprovalPattern.READ)
  async findAll(@Payload() payload: { companyId: string, status: PowerAccessApprovalStatus }): Promise<PowerAccessApprovalEntity[]> {
    return this.service.findAll(payload.companyId, payload.status);
  }
}