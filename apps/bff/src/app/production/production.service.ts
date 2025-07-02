import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerException,
  BrokerQueues, HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProductionMessagePatterns,
  UnitMessagePatterns
} from '@h2-trust/amqp';
import { CreateProductionDto, ProcessType, ProductionOverviewDto } from '@h2-trust/api';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy) { }

  async createProduction(dto: CreateProductionDto): Promise<ProductionOverviewDto[]> {
    const hydrogenColor = await this.fetchHydrogenColor(dto.powerProductionUnitId);
    const hydrogenStorageUnitId = await this.fetchHydrogenStorageUnitId(dto.hydrogenProductionUnitId);

    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, { dto, hydrogenColor, hydrogenStorageUnitId })
    );

    return processSteps
      .filter((step) => step.processType === ProcessType.HYDROGEN_PRODUCTION)
      .map(ProductionOverviewDto.fromEntity);
  }

  private async fetchHydrogenColor(powerProductionUnitId: string): Promise<string> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: powerProductionUnitId }),
    );

    const hydrogenColor = powerProductionUnit?.type?.hydrogenColor;

    if (!hydrogenColor) {
      throw new BrokerException(
        `Hydrogen Color for Power Production Unit ${powerProductionUnitId} is undefined`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return hydrogenColor;
  }

  private async fetchHydrogenStorageUnitId(hydrogenProductionUnitId: string): Promise<string | undefined> {
    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: hydrogenProductionUnitId }),
    );
    return hydrogenProductionUnit.hydrogenStorageUnit?.id;
  }
}
