import { Inject, Injectable } from '@nestjs/common';
import { PowerAccessApprovalDto, PowerAccessApprovalStatus } from '@h2-trust/api';
import { firstValueFrom } from 'rxjs';
import { BrokerQueues, PowerAccessApprovalPattern } from '@h2-trust/amqp';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class PowerAccessApprovalService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
  ) { }


  async findAll(companyId: string, _status: PowerAccessApprovalStatus): Promise<PowerAccessApprovalDto[]> {
    return firstValueFrom(this.generalService.send(PowerAccessApprovalPattern.READ, { companyId: companyId, status: _status }))
    .then((entities) => entities.map(PowerAccessApprovalDto.fromEntity));
  }
}
