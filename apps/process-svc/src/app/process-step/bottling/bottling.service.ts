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
  HydrogenComponentEntity,
  HydrogenCompositionUtil,
  HydrogenStorageUnitEntity,
  ProcessStepEntity,
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
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
    private readonly processStepRepository: ProcessStepRepository,
    private readonly batchRepository: BatchRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepService: ProcessStepService,
  ) {}

  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    const allProcessStepsFromStorageUnit: ProcessStepEntity[] =
      await this.processStepRepository.findAllProcessStepsFromStorageUnit(payload.hydrogenStorageUnitId);

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
    await this.batchRepository.setBatchesInactive(batchesToSetInactive.map((batch) => batch.id));

    const persistedConsumedSplitProcessSteps: ProcessStepEntity[] = await Promise.all(
      allocation.consumedSplitProcessSteps.map((step) => this.processStepRepository.insertProcessStep(step)),
    );
    const persistedConsumedSplitBatches: BatchEntity[] = persistedConsumedSplitProcessSteps.map((ps) => ps.batch);

    await Promise.all(
      allocation.processStepsForRemainingAmount.map((ps) => this.processStepRepository.insertProcessStep(ps)),
    );

    const bottlingProcessStep: ProcessStepEntity = BottlingProcessStepAssembler.assemble(payload, [
      ...allocation.batchesForBottle,
      ...persistedConsumedSplitBatches,
    ]);
    const persistedBottlingProcessStep: ProcessStepEntity =
      await this.processStepRepository.insertProcessStep(bottlingProcessStep);

    if (payload.files) {
      await Promise.all(
        payload.files.map((file) =>
          this.addDocumentToProcessStep(file, persistedBottlingProcessStep.id, payload.fileDescription),
        ),
      );
    }

    return this.processStepService.readProcessStep(new ReadByIdPayload(persistedBottlingProcessStep.id));
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

  private async addDocumentToProcessStep(file: Express.Multer.File, processStepId: string, description: string) {
    const fileName = await this.storageService.uploadFileWithDeepPath(file, `process-step`, processStepId);
    return this.documentRepository.addDocumentToProcessStep(
      {
        description: description,
        location: fileName,
      },
      processStepId,
    );
  }

  async calculateHydrogenComposition(payload: ReadByIdPayload): Promise<HydrogenComponentEntity[]> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(payload);

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

    const predecessor: ProcessStepEntity = await this.processStepService.readProcessStep(
      new ReadByIdPayload(predecessorId),
    );

    if (predecessor.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new BrokerException(
        `Predecessor process step ${predecessor.id} is not of type ${ProcessType.HYDROGEN_BOTTLING}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return predecessor;
  }
}
