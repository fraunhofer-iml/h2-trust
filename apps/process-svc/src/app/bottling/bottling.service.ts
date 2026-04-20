/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  BrokerException,
  HydrogenCompositionUtil,
} from '@h2-trust/amqp';
import { DocumentRepository } from '@h2-trust/database';
import { HydrogenColor, RfnboType } from '@h2-trust/domain';
import { CentralizedStorageService, ContentType } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step/process-step.service';
import { BottlingProcessStepAssembler } from './utils/bottling-process-step.assembler';
import { BottlingAllocation, BottlingAllocator } from './utils/bottling.allocator';
import { ProcessStepEntity, PaginatedProcessStepEntity, HydrogenComponentEntity, BatchEntity, DocumentEntity, CreateHydrogenBottlingPayload, ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload, ReadProcessStepsByTypesAndActiveAndOwnerPayload } from '@h2-trust/contracts';

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
}
