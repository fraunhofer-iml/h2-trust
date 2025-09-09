import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, PowerAccessApprovalPattern } from '@h2-trust/amqp';
import { PowerAccessApprovalDto, PowerAccessApprovalStatus } from '@h2-trust/api';

@Injectable()
export class PowerAccessApprovalService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async findAll(
    userId: string,
    powerAccessApprovalStatus: PowerAccessApprovalStatus,
  ): Promise<PowerAccessApprovalDto[]> {
    return firstValueFrom(
      this.generalService.send(PowerAccessApprovalPattern.READ, { userId, powerAccessApprovalStatus }),
    ).then((entities) => entities.map(PowerAccessApprovalDto.fromEntity));
  }
}
