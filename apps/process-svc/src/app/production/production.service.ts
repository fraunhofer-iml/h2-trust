import { firstValueFrom } from 'rxjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BaseUnitEntity,
  BatchEntity,
  BrokerQueues,
  CompanyEntity,
  CreateProductionEntity,
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  UserEntity,
} from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchTypeDbEnum } from '@h2-trust/database';
import { ProductionUtils } from './utils/production.utils';

interface CreateProcessStepsParams {
  productionStartedAt: string;
  productionEndedAt: string;
  accountingPeriodInSeconds: number;
  processType: ProcessType;
  batchActivity: boolean;
  batchAmount: number;
  batchQuality: string;
  batchType: BatchTypeDbEnum;
  batchOwner: string;
  hydrogenStorageUnitId: string;
  recordedBy: string;
  executedBy: string;
  predecessors: string[];
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);
  private readonly powerAccountingPeriodInSeconds: number;
  private readonly hydrogenAccountingPeriodInSeconds: number;

  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    private readonly configurationService: ConfigurationService,
  ) {
    const configuration = this.configurationService.getProcessSvcConfiguration();
    this.powerAccountingPeriodInSeconds = configuration.powerAccountingPeriodInSeconds;
    this.hydrogenAccountingPeriodInSeconds = configuration.hydrogenAccountingPeriodInSeconds;
  }

  async createProduction(createProductionEntity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    const powerProductionProcessSteps: ProcessStepEntity[] = await this.createProcessSteps({
      productionStartedAt: createProductionEntity.productionStartedAt,
      productionEndedAt: createProductionEntity.productionEndedAt,
      accountingPeriodInSeconds: this.powerAccountingPeriodInSeconds,
      processType: ProcessType.POWER_PRODUCTION,
      batchActivity: false,
      batchAmount: createProductionEntity.powerAmountKwh,
      batchQuality: '{}',
      batchType: BatchTypeDbEnum.POWER,
      batchOwner: createProductionEntity.companyIdOfPowerProductionUnit,
      hydrogenStorageUnitId: null,
      recordedBy: createProductionEntity.recordedBy,
      executedBy: createProductionEntity.powerProductionUnitId,
      predecessors: [],
    });

    const hydrogenProductionProcessSteps: ProcessStepEntity[] = await this.createProcessSteps({
      productionStartedAt: createProductionEntity.productionStartedAt,
      productionEndedAt: createProductionEntity.productionEndedAt,
      accountingPeriodInSeconds: this.hydrogenAccountingPeriodInSeconds,
      processType: ProcessType.HYDROGEN_PRODUCTION,
      batchActivity: true,
      batchAmount: createProductionEntity.hydrogenAmountKg,
      batchQuality: JSON.stringify({ color: createProductionEntity.hydrogenColor }),
      batchType: BatchTypeDbEnum.HYDROGEN,
      batchOwner: createProductionEntity.companyIdOfHydrogenProductionUnit,
      hydrogenStorageUnitId: createProductionEntity.hydrogenStorageUnitId,
      recordedBy: createProductionEntity.recordedBy,
      executedBy: createProductionEntity.hydrogenProductionUnitId,
      predecessors: powerProductionProcessSteps.map((step) => step.batch.id),
    });

    return [...powerProductionProcessSteps, ...hydrogenProductionProcessSteps];
  }

  private async createProcessSteps(params: CreateProcessStepsParams): Promise<ProcessStepEntity[]> {
    this.logger.debug(`# ${ProcessType[params.processType]}`);

    const processSteps: ProcessStepEntity[] = [];
    const productionStartedAtInSeconds = new Date(params.productionStartedAt).getTime() / 1000;
    const productionEndedAtInSeconds = new Date(params.productionEndedAt).getTime() / 1000;
    const productionStartedAtInSecondsAligned =
      Math.floor(productionStartedAtInSeconds / params.accountingPeriodInSeconds) * params.accountingPeriodInSeconds;

    const numberOfAccountingPeriods = ProductionUtils.calculateNumberOfAccountingPeriods(
      productionStartedAtInSecondsAligned,
      productionEndedAtInSeconds,
      params.accountingPeriodInSeconds,
    );

    for (let i = 0; i < numberOfAccountingPeriods; i++) {
      this.logger.debug(`## Accounting Period ${i + 1} of ${numberOfAccountingPeriods}`);

      const startedAt = ProductionUtils.calculateProductionStartDate(
        productionStartedAtInSecondsAligned,
        params.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`Period ${i + 1} started At: ${startedAt.toISOString()}`);

      const endedAt = ProductionUtils.calculateProductionEndDate(
        productionStartedAtInSecondsAligned,
        params.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`Period ${i + 1} ended At: ${endedAt.toISOString()}`);

      const amountPerAccountingPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
        params.batchAmount,
        numberOfAccountingPeriods,
      );
      this.logger.debug(`Amount per period: ${amountPerAccountingPeriod}`);

      processSteps.push(
        new ProcessStepEntity(
          null,
          startedAt,
          endedAt,
          params.processType,
          {
            active: params.batchActivity,
            amount: amountPerAccountingPeriod,
            quality: params.batchQuality,
            type: params.batchType,
            predecessors: params.predecessors.slice(i, i + 1).map((id) => ({ id: id })),
            owner: { id: params.batchOwner } as CompanyEntity,
            hydrogenStorageUnit: { id: params.hydrogenStorageUnitId } as HydrogenStorageUnitEntity,
          } as BatchEntity,
          { id: params.recordedBy } as UserEntity,
          { id: params.executedBy } as BaseUnitEntity,
          null,
        ),
      );
    }

    return Promise.all(
      processSteps.map((step) =>
        firstValueFrom(
          this.batchService.send(ProcessStepMessagePatterns.CREATE, { processStepEntity: step }),
        ),
      ),
    );
  }
}
