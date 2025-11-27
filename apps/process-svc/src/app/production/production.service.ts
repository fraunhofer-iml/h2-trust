/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BaseUnitEntity,
  BatchEntity,
  BrokerException,
  BrokerQueues,
  CompanyEntity,
  CreateProductionEntity,
  HydrogenProductionUnitEntity,
  HydrogenStorageUnitEntity,
  IntervallMappingResult,
  ParsedFileBundles,
  PowerAccessApprovalEntity,
  PowerAccessApprovalPatterns,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionIntervallEntity,
  QualityDetailsEntity,
  SubmitProductionProps,
  UnitMessagePatterns,
  UserEntity,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { ProductionIntervallRepository } from '@h2-trust/database';
import { BatchType, PowerAccessApprovalStatus, ProcessType } from '@h2-trust/domain';
import { DateTimeUtil } from '@h2-trust/utils';
import { AccountingPeriodMatcherService } from './accounting-period-matching/accounting-period-matcher.service';
import { ProductionUtils } from './utils/production.utils';

interface CreateProcessStepsParams {
  productionStartedAt: string;
  productionEndedAt: string;
  accountingPeriodInSeconds: number;
  type: ProcessType;
  batchActivity: boolean;
  batchAmount: number;
  batchQuality: string;
  batchType: BatchType;
  batchOwner: string;
  hydrogenStorageUnitId: string;
  recordedBy: string;
  executedBy: string;
  predecessors: ProcessStepEntity[];
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);
  private readonly secondsPerHour = 3600;
  private readonly powerAccountingPeriodInSeconds: number;
  private readonly waterAccountingPeriodInSeconds: number;
  private readonly hydrogenAccountingPeriodInSeconds: number;

  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    private readonly configurationService: ConfigurationService,
    private readonly accountingPeriodMatcher: AccountingPeriodMatcherService,
    private readonly intervallRepo: ProductionIntervallRepository,
  ) {
    const configuration = this.configurationService.getProcessSvcConfiguration();
    this.powerAccountingPeriodInSeconds = configuration.powerAccountingPeriodInSeconds;
    this.waterAccountingPeriodInSeconds = configuration.waterAccountingPeriodInSeconds;
    this.hydrogenAccountingPeriodInSeconds = configuration.hydrogenAccountingPeriodInSeconds;
  }

  async createProduction(
    createProductionEntity: CreateProductionEntity,
    isSingleAccountingPeriod: boolean,
  ): Promise<ProcessStepEntity[]> {
    this.logger.debug(`### START PRODUCTION ###`);

    const powerProductionProcessSteps: ProcessStepEntity[] = await this.createPowerProductionProcessSteps(
      createProductionEntity,
      isSingleAccountingPeriod,
    );

    const waterConsumptionProcessSteps: ProcessStepEntity[] = [];
    await this.createWaterConsumptionProcessSteps(createProductionEntity, isSingleAccountingPeriod);

    const hydrogenProductionProcessSteps: ProcessStepEntity[] = await this.createHydrogenProductionProcessSteps(
      createProductionEntity,
      powerProductionProcessSteps,
      waterConsumptionProcessSteps,
      isSingleAccountingPeriod,
    );

    this.logger.debug(`### END PRODUCTION ###`);

    return [...powerProductionProcessSteps, ...waterConsumptionProcessSteps, ...hydrogenProductionProcessSteps];
  }

  private async createPowerProductionProcessSteps(
    createProductionEntity: CreateProductionEntity,
    isSingleAccountingPeriod: boolean,
  ): Promise<ProcessStepEntity[]> {
    return this.createProcessSteps(
      {
        productionStartedAt: createProductionEntity.productionStartedAt,
        productionEndedAt: createProductionEntity.productionEndedAt,
        accountingPeriodInSeconds: isSingleAccountingPeriod ? 3600 : this.powerAccountingPeriodInSeconds,
        type: ProcessType.POWER_PRODUCTION,
        batchActivity: false,
        batchAmount: createProductionEntity.powerAmountKwh,
        batchQuality: null,
        batchType: BatchType.POWER,
        batchOwner: createProductionEntity.companyIdOfPowerProductionUnit,
        hydrogenStorageUnitId: null,
        recordedBy: createProductionEntity.recordedBy,
        executedBy: createProductionEntity.powerProductionUnitId,
        predecessors: [],
      },
      isSingleAccountingPeriod,
    );
  }

  private async createWaterConsumptionProcessSteps(
    createProductionEntity: CreateProductionEntity,
    isSingleAccountingPeriod: boolean,
  ): Promise<ProcessStepEntity[]> {
    const waterAmountLiters: number = await this.calculateTotalWaterAmount(createProductionEntity);

    return this.createProcessSteps(
      {
        productionStartedAt: createProductionEntity.productionStartedAt,
        productionEndedAt: createProductionEntity.productionEndedAt,
        accountingPeriodInSeconds: isSingleAccountingPeriod ? 3600 : this.waterAccountingPeriodInSeconds,
        type: ProcessType.WATER_CONSUMPTION,
        batchActivity: false,
        batchAmount: waterAmountLiters,
        batchQuality: null,
        batchType: BatchType.WATER,
        batchOwner: createProductionEntity.companyIdOfHydrogenProductionUnit,
        hydrogenStorageUnitId: null,
        recordedBy: createProductionEntity.recordedBy,
        executedBy: createProductionEntity.hydrogenProductionUnitId,
        predecessors: [],
      },
      isSingleAccountingPeriod,
    );
  }

  private async calculateTotalWaterAmount(createProductionEntity: CreateProductionEntity): Promise<number> {
    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: createProductionEntity.hydrogenProductionUnitId }),
    );

    if (!Number.isFinite(hydrogenProductionUnit?.waterConsumptionLitersPerHour)) {
      throw new Error(
        `Invalid or missing waterConsumptionLitersPerHour for HydrogenProductionUnit with id: ${createProductionEntity.hydrogenProductionUnitId}`,
      );
    }

    const startedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(createProductionEntity.productionStartedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(createProductionEntity.productionEndedAt);
    const durationInSeconds = ProductionUtils.calculateDuration(startedAtInSeconds, endedAtInSeconds);

    return (hydrogenProductionUnit.waterConsumptionLitersPerHour / this.secondsPerHour) * durationInSeconds;
  }

  private async createHydrogenProductionProcessSteps(
    createProductionEntity: CreateProductionEntity,
    powerProductionProcessSteps: ProcessStepEntity[],
    waterConsumptionProcessSteps: ProcessStepEntity[],
    isSingleAccountingPeriod: boolean,
  ): Promise<ProcessStepEntity[]> {
    return this.createProcessSteps(
      {
        productionStartedAt: createProductionEntity.productionStartedAt,
        productionEndedAt: createProductionEntity.productionEndedAt,
        accountingPeriodInSeconds: isSingleAccountingPeriod ? 3600 : this.hydrogenAccountingPeriodInSeconds,
        type: ProcessType.HYDROGEN_PRODUCTION,
        batchActivity: true,
        batchAmount: createProductionEntity.hydrogenAmountKg,
        batchQuality: createProductionEntity.hydrogenColor,
        batchType: BatchType.HYDROGEN,
        batchOwner: createProductionEntity.companyIdOfHydrogenProductionUnit,
        hydrogenStorageUnitId: createProductionEntity.hydrogenStorageUnitId,
        recordedBy: createProductionEntity.recordedBy,
        executedBy: createProductionEntity.hydrogenProductionUnitId,
        predecessors: [...powerProductionProcessSteps, ...waterConsumptionProcessSteps],
      },
      isSingleAccountingPeriod,
    );
  }

  private async createProcessSteps(
    params: CreateProcessStepsParams,
    isSingleAccountingPeriod: boolean,
  ): Promise<ProcessStepEntity[]> {
    const processSteps: ProcessStepEntity[] = [];
    const startedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(params.productionStartedAt);
    const endedAtInSeconds = DateTimeUtil.convertDateStringToSeconds(params.productionEndedAt);
    const startedAtInSecondsAligned =
      Math.floor(startedAtInSeconds / params.accountingPeriodInSeconds) * params.accountingPeriodInSeconds;

    const numberOfAccountingPeriods = isSingleAccountingPeriod
      ? 1
      : ProductionUtils.calculateNumberOfAccountingPeriods(
          startedAtInSecondsAligned,
          endedAtInSeconds,
          params.accountingPeriodInSeconds,
        );

    const amountPerAccountingPeriod = ProductionUtils.calculateBatchAmountPerPeriod(
      params.batchAmount,
      numberOfAccountingPeriods,
    );

    for (let i = 0; i < numberOfAccountingPeriods; i++) {
      this.logger.debug(
        `## Accounting Period ${i + 1} of ${numberOfAccountingPeriods} for process type ${params.type} ##`,
      );
      this.logger.debug(`amount: ${amountPerAccountingPeriod}`);

      const startedAt = ProductionUtils.calculateProductionStartDate(
        startedAtInSecondsAligned,
        params.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`started At: ${startedAt.toISOString()}`);

      const endedAt = ProductionUtils.calculateProductionEndDate(
        startedAtInSecondsAligned,
        params.accountingPeriodInSeconds,
        i,
      );
      this.logger.debug(`ended At: ${endedAt.toISOString()}`);

      const predecessors: BatchEntity[] = params.predecessors
        .filter(
          (step) =>
            DateTimeUtil.convertDateToMilliseconds(step.startedAt) ===
            DateTimeUtil.convertDateToMilliseconds(startedAt),
        )
        .map((processStep) => processStep.batch);

      processSteps.push(
        new ProcessStepEntity(
          null,
          startedAt,
          endedAt,
          params.type,
          new BatchEntity(
            null,
            params.batchActivity,
            amountPerAccountingPeriod,
            params.batchType,
            predecessors,
            [],
            { id: params.batchOwner } as CompanyEntity,
            { id: params.hydrogenStorageUnitId } as HydrogenStorageUnitEntity,
            params.batchQuality ? new QualityDetailsEntity(null, params.batchQuality) : null,
          ),
          { id: params.recordedBy } as UserEntity,
          { id: params.executedBy } as BaseUnitEntity,
          null,
        ),
      );
    }

    return Promise.all(
      processSteps.map((step) =>
        firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.CREATE, { processStepEntity: step })),
      ),
    );
  }

  async matchAccountingPeriods(data: ParsedFileBundles, userId: string) {
    const gridUnitId = await this.fetchGridUnitId(userId);
    const productionIntervalls: ProductionIntervallEntity[] = this.accountingPeriodMatcher.matchIntervalls(
      data,
      gridUnitId,
    );

    const { id, createdAt } = await this.intervallRepo.createProductionIntervalls(productionIntervalls);
    return new IntervallMappingResult(id, createdAt, productionIntervalls);
  }

  async saveImportedData(props: SubmitProductionProps): Promise<ProcessStepEntity[]> {
    const intervalls = await this.intervallRepo.getIntervallSetById(props.accountingPeriodSetId);

    return await Promise.all(
      intervalls.map(async (intervall) => {
        const hydrogenColor = await this.fetchHydrogenColor(intervall.powerProductionUnitId);
        const companyIdOfPowerProductionUnit = await this.fetchCompanyOfProductionUnit(intervall.powerProductionUnitId);
        const companyIdOfHydrogenProductionUnit = await this.fetchCompanyOfProductionUnit(
          intervall.hydrogenProductionUnitId,
        );

        const startedAt: Date = new Date(intervall.date);
        const endedAt: Date = new Date(new Date(intervall.date).setMinutes(59, 59, 999));

        const entity = new CreateProductionEntity(
          startedAt.toISOString(),
          endedAt.toISOString(),
          intervall.powerProductionUnitId,
          intervall.powerAmount,
          intervall.hydrogenProductionUnitId,
          intervall.hydrogenAmount,
          props.recordedBy,
          hydrogenColor,
          props.hydrogenStorageUnitId,
          companyIdOfPowerProductionUnit,
          companyIdOfHydrogenProductionUnit,
        );

        return this.createProduction(entity, true);
      }),
    ).then((processSteps) => processSteps.flat());
  }

  private async fetchHydrogenColor(powerProductionUnitId: string): Promise<string> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: powerProductionUnitId }),
    );

    const hydrogenColor = powerProductionUnit?.type?.hydrogenColor;

    if (!hydrogenColor) {
      throw new BrokerException(
        `Power Production Unit ${powerProductionUnitId} has no Hydrogen Color`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return hydrogenColor;
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

  private async fetchGridUnitId(userId: string): Promise<string> {
    const approvals: PowerAccessApprovalEntity[] = await firstValueFrom(
      this.generalService.send(PowerAccessApprovalPatterns.READ, {
        userId: userId,
        powerAccessApprovalStatus: PowerAccessApprovalStatus.APPROVED,
      }),
    );
    const powerAccessApprovalForGrid = approvals.find((approval) => approval.powerProductionUnit.type.name === 'GRID');

    if (!powerAccessApprovalForGrid)
      throw new BrokerException(`No grid connection found.`, HttpStatus.INTERNAL_SERVER_ERROR);

    return powerAccessApprovalForGrid.powerProductionUnit.id;
  }
}
