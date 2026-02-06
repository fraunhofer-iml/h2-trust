/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BatchEntity,
  BrokerException,
  BrokerQueues,
  CreateHydrogenBottlingPayload,
  DocumentEntity,
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { DocumentRepository } from '@h2-trust/database';
import { HydrogenColor, ProcessType } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step.service';
import { BottlingProcessStepAssembler } from './bottling-process-step.assembler';
import { BottlingAllocation, BottlingAllocator } from './bottling.allocator';
import { HydrogenComponentAssembler } from './hydrogen-component.assembler';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly storageService: StorageService,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepService: ProcessStepService,
  ) {}

  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    const allProcessStepsFromStorageUnit: ProcessStepEntity[] =
      await this.processStepService.readAllProcessStepsFromStorageUnit(payload.hydrogenStorageUnitId);

    if (allProcessStepsFromStorageUnit.length === 0) {
      throw new BrokerException(
        `No process steps found in storage unit ${payload.hydrogenStorageUnitId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hydrogenComposition: HydrogenComponentEntity[] = await this.determineHydrogenComposition(
      payload.amount,
      payload.color,
      payload.hydrogenStorageUnitId,
    );

    const allocation: BottlingAllocation = BottlingAllocator.allocate(
      allProcessStepsFromStorageUnit,
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

  private async determineHydrogenComposition(
    batchAmount: number,
    hydrogenColor: HydrogenColor,
    executedById: string,
  ): Promise<HydrogenComponentEntity[]> {
    if (hydrogenColor === HydrogenColor.GREEN) {
      return [new HydrogenComponentEntity(HydrogenColor.GREEN, batchAmount)];
    }

    const hydrogenStorageUnit: HydrogenStorageUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(executedById)),
    );

    try {
      return HydrogenCompositionUtil.computeHydrogenComposition(hydrogenStorageUnit.filling, batchAmount);
    } catch (BrokerException) {
      throw new BrokerException(
        `Total stored amount of ${hydrogenStorageUnit.id} is not greater than 0`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async addDocumentToProcessStep(file: Express.Multer.File, processStepId: string): Promise<DocumentEntity> {
    await this.storageService.uploadPdfFile(file.originalname, Buffer.from(file.buffer));

    return this.documentRepository.addDocumentToProcessStep(
      new DocumentEntity(undefined, file.originalname),
      processStepId,
    );
  }

  async calculateHydrogenComposition(processStep: ProcessStepEntity): Promise<HydrogenComponentEntity[]> {
    const hydrogenBottling: ProcessStepEntity =
      processStep.type === ProcessType.HYDROGEN_BOTTLING ? processStep : await this.readHydrogenBottling(processStep);

    return HydrogenComponentAssembler.assemble(hydrogenBottling);
  }

  private async readHydrogenBottling(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    const predecessorId: string = processStep.batch?.predecessors[0]?.processStepId;

    if (!predecessorId) {
      throw new BrokerException(
        `Process step ${processStep.id} has no predecessor to derive composition from`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const predecessor: ProcessStepEntity = await this.processStepService.readProcessStep(predecessorId);

    if (predecessor.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new BrokerException(
        `Predecessor process step ${predecessor.id} is not of type ${ProcessType.HYDROGEN_BOTTLING}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return predecessor;
  }
}
