import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, ProcessStepEntity, ProductionMessagePatterns } from '@h2-trust/amqp';
import { CreateProductionDto, ProcessType, ProductionOverviewDto } from '@h2-trust/api';

@Injectable()
export class ProductionService {
  constructor(@Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy) {}

  async createProduction(dto: CreateProductionDto): Promise<ProductionOverviewDto[]> {
    return firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, {
        dto,
      }),
    )
      .then((entities) =>
        entities.filter((step: ProcessStepEntity) => step.processType === ProcessType.HYDROGEN_PRODUCTION),
      )
      .then((entities) => entities.map(ProductionOverviewDto.fromEntity));
  }
}
