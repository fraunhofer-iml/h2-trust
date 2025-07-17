import { firstValueFrom } from 'rxjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BaseUnitEntity,
  BatchEntity,
  BrokerQueues,
  CompanyEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  UserEntity,
} from '@h2-trust/amqp';
import { CreateProductionDto, ProcessType } from '@h2-trust/api';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchTypeDbEnum } from '@h2-trust/database';
import { ProductionUtils } from './utils/production.utils';

interface CreateProcessStepsParams {
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

  // TODO-MP(DUHGW-106): as soon as DUHGW-78 is merged, remove these constants and fetch those IDs from jwt/database
  private static readonly POWER_COMPANY_ID = 'company-power-1';
  private static readonly POWER_USER_ID = 'user-power-1';
  private static readonly HYDROGEN_COMPANY_ID = 'company-hydrogen-1';
  private static readonly HYDROGEN_USER_ID = '6f63a1a9-6cc5-4a7a-98b2-79a0460910f4';

  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    private readonly configurationService: ConfigurationService,
  ) {
    const configuration = this.configurationService.getProcessSvcConfiguration();
    this.powerAccountingPeriodInSeconds = configuration.powerAccountingPeriodInSeconds;
    this.hydrogenAccountingPeriodInSeconds = configuration.hydrogenAccountingPeriodInSeconds;
  }

  async createProduction(
    dto: CreateProductionDto,
    hydrogenColor: string,
    hydrogenStorageUnitId: string,
  ): Promise<ProcessStepEntity[]> {
    const powerProductionProcessSteps: ProcessStepEntity[] = await this.createProcessSteps(dto, {
      accountingPeriodInSeconds: this.powerAccountingPeriodInSeconds,
      processType: ProcessType.POWER_PRODUCTION,
      batchActivity: false,
      batchAmount: dto.powerAmountKwh,
      batchQuality: '{}',
      batchType: BatchTypeDbEnum.POWER,
      batchOwner: ProductionService.POWER_COMPANY_ID,
      hydrogenStorageUnitId: null,
      recordedBy: ProductionService.POWER_USER_ID,
      executedBy: dto.powerProductionUnitId,
      predecessors: [],
    });

    const hydrogenProductionProcessSteps: ProcessStepEntity[] = await this.createProcessSteps(dto, {
      accountingPeriodInSeconds: this.hydrogenAccountingPeriodInSeconds,
      processType: ProcessType.HYDROGEN_PRODUCTION,
      batchActivity: true,
      batchAmount: dto.hydrogenAmountKg,
      batchQuality: JSON.stringify({ color: hydrogenColor }),
      batchType: BatchTypeDbEnum.HYDROGEN,
      batchOwner: ProductionService.HYDROGEN_COMPANY_ID,
      hydrogenStorageUnitId: hydrogenStorageUnitId,
      recordedBy: ProductionService.HYDROGEN_USER_ID,
      executedBy: dto.hydrogenProductionUnitId,
      predecessors: powerProductionProcessSteps.map((step) => step.batch.id),
    });

    return [...powerProductionProcessSteps, ...hydrogenProductionProcessSteps];
  }

  private async createProcessSteps(
    dto: CreateProductionDto,
    params: CreateProcessStepsParams,
  ): Promise<ProcessStepEntity[]> {
    this.logger.debug(`# ${ProcessType[params.processType]}`);

    const processSteps: ProcessStepEntity[] = [];
    const productionStartedAtInSeconds = new Date(dto.productionStartedAt).getTime() / 1000;
    const productionEndedAtInSeconds = new Date(dto.productionEndedAt).getTime() / 1000;
    const productionStartedAtInSecondsAligned = Math.floor(productionStartedAtInSeconds / params.accountingPeriodInSeconds) * params.accountingPeriodInSeconds;

    const numberOfAccountingPeriods = ProductionUtils.calculateNumberOfAccountingPeriods(
      productionStartedAtInSecondsAligned,
      productionEndedAtInSeconds,
      params.accountingPeriodInSeconds,
    );

    for (let i = 0; i < numberOfAccountingPeriods; i++) {
      this.logger.debug(`## Accounting Period ${i + 1} of ${numberOfAccountingPeriods}`);

      const startedAt = ProductionUtils.calculateProductionStartDate(productionStartedAtInSecondsAligned, params.accountingPeriodInSeconds, i);
      this.logger.debug(`Period ${i + 1} started At: ${startedAt.toISOString()}`);

      const endedAt = ProductionUtils.calculateProductionEndDate(productionStartedAtInSecondsAligned, params.accountingPeriodInSeconds, i);
      this.logger.debug(`Period ${i + 1} ended At: ${endedAt.toISOString()}`);

      const amountPerAccountingPeriod = ProductionUtils.calculateBatchAmountPerPeriod(params.batchAmount, numberOfAccountingPeriods);
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
            owner: { id: params.batchOwner } as CompanyEntity,
            hydrogenStorageUnitId: params.hydrogenStorageUnitId,
          } as BatchEntity,
          { id: params.recordedBy } as UserEntity,
          { id: params.executedBy } as BaseUnitEntity,
          null,
        ),
      );
    }

    return Promise.all(
      processSteps.map((step, index) =>
        firstValueFrom(
          this.batchService.send(ProcessStepMessagePatterns.CREATE, {
            processStepEntity: step,
            predecessors: params.predecessors[index] ? [params.predecessors[index]] : [],
          }),
        ),
      ),
    );
  }
}
