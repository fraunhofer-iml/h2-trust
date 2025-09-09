import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, CompanyMessagePatterns } from '@h2-trust/amqp';
import { CompanyDto } from '@h2-trust/api';

@Injectable()
export class CompanyService {
  constructor(@Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy) {}

  async findAll(): Promise<CompanyDto[]> {
    return await firstValueFrom(this.generalService.send(CompanyMessagePatterns.READ_ALL, {})).then((entities) =>
      entities.map(CompanyDto.fromEntity),
    );
  }
}
