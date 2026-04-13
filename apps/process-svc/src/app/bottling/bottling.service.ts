/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  BatchEntity,
  BrokerException,
  CreateHydrogenBottlingPayload,
  CreateHydrogenProductionStatisticsPayload,
  DocumentEntity,
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  HydrogenStatisticsEntity,
  PaginatedProcessStepEntity,
  PowerStatisticsEntity,
  ProcessStepEntity,
  ProductionStatisticsEntity,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/amqp';
import { DocumentRepository } from '@h2-trust/database';
import { BatchType, HydrogenColor, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { CentralizedStorageService, ContentType } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step/process-step.service';
import { BottlingProcessStepAssembler } from './utils/bottling-process-step.assembler';
import { BottlingAllocation, BottlingAllocator } from './utils/bottling.allocator';

@Injectable()
export class BottlingService {
  logger = new Logger('BottlingService');
  constructor(
    private readonly storageService: CentralizedStorageService,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepService: ProcessStepService,
  ) {}

  async readProcessStepsByTypesAndActiveAndOwner(
    payload: ReadProcessStepsByTypesAndActiveAndOwnerPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessStepsByTypesAndActiveAndOwner(payload);
  }

  async readProcessStepsByPredecessorTypesAndOwner(
    payload: ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ): Promise<PaginatedProcessStepEntity> {
    if (payload.filter.pageNumber <= 0) {
      throw new BrokerException(
        `No process steps found in storage unit ${payload.filter.pageNumber}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.filter.pageSize <= 0) {
      throw new BrokerException(
        `No process steps found in storage unit ${payload.filter.pageSize}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.processStepService.readPaginatedProcessStepsByPredecessorTypesAndOwner(payload);
  }

  async createProductionStatistics(
    payload: CreateHydrogenProductionStatisticsPayload,
  ): Promise<ProductionStatisticsEntity> {
    const hydrogenProcesses: ProcessStepEntity[] =
      await this.processStepService.readProcessStepsByPredecessorTypesAndUnitAndDate(
        [ProcessType.POWER_PRODUCTION],
        payload,
      );

    const invalidProcessTypes = [
      ...new Set(
        hydrogenProcesses
          .filter((processStep) => processStep.type !== ProcessType.HYDROGEN_PRODUCTION)
          .map((processStep) => processStep.type),
      ),
    ];

    if (invalidProcessTypes.length > 0) {
      throw new Error(
        `Expected only ${ProcessType.HYDROGEN_PRODUCTION} process steps, but received: ${invalidProcessTypes.join(', ')}`,
      );
    }

    const hydrogenStatistics = this.createHydrogenStatistics(hydrogenProcesses);

    const powerStatistics = this.createPowerStatistics(hydrogenProcesses);

    return new ProductionStatisticsEntity(hydrogenStatistics, powerStatistics);
  }

  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    const processStepsFromStorageUnit: ProcessStepEntity[] =
      await this.processStepService.readAllProcessStepsFromStorageUnit(payload.hydrogenStorageUnitId);

    if (processStepsFromStorageUnit.length === 0) {
      throw new BrokerException(
        `No process steps found in storage unit ${payload.hydrogenStorageUnitId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const fillings: HydrogenComponentEntity[] = processStepsFromStorageUnit.map((processStep) => ({
      processId: processStep.id,
      color: processStep.batch.qualityDetails.color,
      amount: processStep.batch.amount,
      rfnboType: processStep.batch.qualityDetails.rfnboType,
    }));

    const hydrogenComposition: HydrogenComponentEntity[] = await this.determineHydrogenComposition(
      payload.amount,
      payload.rfnboType,
      fillings,
      payload.hydrogenStorageUnitId,
    );

    const allocation: BottlingAllocation = BottlingAllocator.allocate(
      processStepsFromStorageUnit,
      hydrogenComposition,
      payload.hydrogenStorageUnitId,
    );

    const batchesToSetInactive: BatchEntity[] = [
      ...allocation.batchesForBottle,
      ...allocation.processStepsToBeSplit.map((ps) => ps.batch),
    ];
    await this.processStepService.setBatchesInactive(batchesToSetInactive.map((batch) => batch.id));

    const persistedConsumedSplitProcessSteps: ProcessStepEntity[] = await Promise.all(
      allocation.consumedSplitProcessSteps.map((step) => this.processStepService.createProcessStep(step)),
    );
    const persistedConsumedSplitBatches: BatchEntity[] = persistedConsumedSplitProcessSteps.map((ps) => ps.batch);

    await Promise.all(
      allocation.processStepsForRemainingAmount.map((ps) => this.processStepService.createProcessStep(ps)),
    );

    const bottlingProcessStep: ProcessStepEntity = BottlingProcessStepAssembler.assemble(payload, [
      ...allocation.batchesForBottle,
      ...persistedConsumedSplitBatches,
    ]);
    const persistedBottlingProcessStep: ProcessStepEntity =
      await this.processStepService.createProcessStep(bottlingProcessStep);

    if (payload.files) {
      await Promise.all(
        payload.files.map((file) => this.addDocumentToProcessStep(file, persistedBottlingProcessStep.id)),
      );
    }

    return this.processStepService.readProcessStep(persistedBottlingProcessStep.id);
  }

  /**
   * Return the set of HydrogenComponents that should be created as new bottling.
   * If the rfnbo type that should be bottled is RFNBO ready, the returned list only contains a single HydrogenComponent with the whole amount of hydrogen and the RFNBO_READY type.
   * If the rfnbo type is non_certified, it should return a mix of RFNBO_ready HCs and non-certified HCs.
   * @param batchAmount The total amount of hydrogen to be filled.
   * @param rfnboType The RFNBO type that the bottled hydrogen should have.
   * @param hydrogenStorageUnitFillings The list of all fillings of the hydrogen storage from which filling is to take place.
   * @param hydrogenStorageUnitId The ID of the hydrogen storage from which filling is to take place.
   * @returns The list of HydrogenEntities that make up the new bottling.
   */
  private async determineHydrogenComposition(
    batchAmount: number,
    rfnboType: RfnboType,
    hydrogenStorageUnitFillings: HydrogenComponentEntity[],
    hydrogenStorageUnitId: string,
  ): Promise<HydrogenComponentEntity[]> {
    if (rfnboType === RfnboType.RFNBO_READY) {
      return [new HydrogenComponentEntity(null, HydrogenColor.GREEN, batchAmount, RfnboType.RFNBO_READY)];
    }

    try {
      return HydrogenCompositionUtil.computeHydrogenComposition(hydrogenStorageUnitFillings, batchAmount);
    } catch (BrokerException) {
      throw new BrokerException(
        `Total stored amount of ${hydrogenStorageUnitId} is not greater than 0`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async addDocumentToProcessStep(file: Express.Multer.File, processStepId: string): Promise<DocumentEntity> {
    await this.storageService.uploadFile(file.originalname, Buffer.from(file.buffer), ContentType.PDF);

    return this.documentRepository.addDocumentToProcessStep(
      new DocumentEntity(undefined, file.originalname),
      processStepId,
    );
  }

  private createHydrogenStatistics(processSteps: ProcessStepEntity[]): HydrogenStatisticsEntity {
    const {
      nonCertifiable,
      rfnboReady,
    }: {
      nonCertifiable: number;
      rfnboReady: number;
    } = processSteps.reduce(
      (statistics, processStep) => {
        const qualityDetails = processStep.batch.qualityDetails;
        if (!processStep.batch.active || !qualityDetails) {
          return statistics;
        }
        switch (qualityDetails.rfnboType) {
          case RfnboType.RFNBO_READY:
            statistics.rfnboReady += processStep.batch.amount;
            break;
          case RfnboType.NON_CERTIFIABLE:
            statistics.nonCertifiable += processStep.batch.amount;
            break;
          default:
            throw new Error(`Rfnbotype of ${processStep.id} not defined`);
        }
        return statistics;
      },
      { nonCertifiable: 0, rfnboReady: 0 },
    );
    return new HydrogenStatisticsEntity(nonCertifiable, rfnboReady);
  }

  private createPowerStatistics(processSteps: ProcessStepEntity[]): PowerStatisticsEntity {
    const batches: BatchEntity[] = processSteps
      .map((ps) => (ps.batch.predecessors ?? []).filter((batch) => batch.type === BatchType.POWER))
      .flat();
    const { renewable, partlyRenewable, nonRenewable } = batches.reduce(
      (statistics, batch) => {
        const qualityDetails = batch.qualityDetails;
        if (!qualityDetails) {
          return statistics;
        }
        switch (qualityDetails.powerType) {
          case PowerType.RENEWABLE:
            statistics.renewable += batch.amount;
            break;
          case PowerType.PARTLY_RENEWABLE:
            statistics.partlyRenewable += batch.amount;
            break;
          case PowerType.NON_RENEWABLE:
            statistics.nonRenewable += batch.amount;
            break;
        }
        return statistics;
      },
      { renewable: 0, partlyRenewable: 0, nonRenewable: 0 },
    );
    return new PowerStatisticsEntity(renewable, partlyRenewable, nonRenewable);
  }
}
