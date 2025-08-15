import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerException,
  BrokerQueues,
  CreateProductionEntity,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import {
  CreateProductionDto,
  ProcessType,
  ProductionOverviewDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
  ) { }

  async createProduction(dto: CreateProductionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const hydrogenColor = await this.fetchHydrogenColor(dto.powerProductionUnitId);
    const hydrogenStorageUnitId = await this.fetchHydrogenStorageUnitId(dto.hydrogenProductionUnitId);
    const companyIdOfPowerProductionUnit = await this.fetchCompanyOfProductionUnit(dto.powerProductionUnitId);
    const companyIdOfHydrogenProductionUnit = await this.fetchCompanyOfProductionUnit(dto.hydrogenProductionUnitId);

    const createProductionEntity = CreateProductionEntity.of(
      dto,
      userId,
      hydrogenColor,
      hydrogenStorageUnitId,
      companyIdOfPowerProductionUnit,
      companyIdOfHydrogenProductionUnit,
    );

    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, { createProductionEntity }),
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
      throw new HttpException(
        `Power Production Unit ${powerProductionUnitId} has no Hydrogen Color`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return hydrogenColor;
  }

  private async fetchHydrogenStorageUnitId(hydrogenProductionUnitId: string): Promise<string | undefined> {
    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: hydrogenProductionUnitId }),
    );

    return hydrogenProductionUnit?.hydrogenStorageUnit.id;
  }

  private async fetchCompanyOfProductionUnit(productionUnitId: string): Promise<string> {
    const productionUnitEntity: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: productionUnitId }),
    );

    if (!productionUnitEntity.company) {
      throw new BrokerException(
        `Production Unit ${productionUnitId} does not have an associated company`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return productionUnitEntity.company.id;
  }

  async readHydrogenProductionsByCompany(userId: string): Promise<ProductionOverviewDto[]> {
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const companyIdOfUser = userDetailsDto.company.id;
    const payload = {
      processType: ProcessType.HYDROGEN_PRODUCTION,
      active: true,
      companyId: companyIdOfUser,
    };

    return firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_ALL, payload)).then((processSteps) =>
      processSteps.map(ProductionOverviewDto.fromEntity),
    );
  }
}
