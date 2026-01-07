/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { StorageService } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step.service';
import { BatchSelection } from './batch-selection.interface';
import { BatchSelectionService } from './batch-selection.service';
import { HydrogenComponentAssembler } from './hydrogen-component-assembler';
import { ProcessStepAssemblerService } from './process-step-assembler.service';
import { HydrogenColor } from '@h2-trust/domain';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly batchSelectionService: BatchSelectionService,
    private readonly processStepAssemblerService: ProcessStepAssemblerService,
    private readonly storageService: StorageService,
    private readonly processStepRepository: ProcessStepRepository,
    private readonly batchRepository: BatchRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepService: ProcessStepService,
  ) { }

  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    const allProcessStepsFromStorageUnit: ProcessStepEntity[] = await this.processStepRepository.findAllProcessStepsFromStorageUnit(
      payload.hydrogenStorageUnitId,
    );

    if (allProcessStepsFromStorageUnit.length === 0) {
      throw new BrokerException(
        `No process steps found in storage unit ${payload.hydrogenStorageUnitId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hydrogenComposition: HydrogenComponentEntity[] = await this.determineHydrogenComposition(
      payload.amount,
      payload.color,
      payload.hydrogenStorageUnitId
    );

    const batchSelection: BatchSelection = this.batchSelectionService.processBottlingForAllColors(
      allProcessStepsFromStorageUnit,
      hydrogenComposition,
      payload.hydrogenStorageUnitId,
    );

    const batchesToSetInactive: BatchEntity[] = [
      ...batchSelection.batchesForBottle,
      ...batchSelection.processStepsToBeSplit.map((ps) => ps.batch),
    ];
    await this.batchRepository.setBatchesInactive(batchesToSetInactive.map((batch) => batch.id));

    const persistedConsumedSplitProcessSteps: ProcessStepEntity[] = await Promise.all(
      batchSelection.consumedSplitProcessSteps.map((step) => this.processStepRepository.insertProcessStep(step)),
    );
    const persistedConsumedSplitBatches: BatchEntity[] = persistedConsumedSplitProcessSteps.map((ps) => ps.batch);

    await Promise.all(
      batchSelection.processStepsForRemainingAmount.map((ps) => this.processStepRepository.insertProcessStep(ps)),
    );

    const bottlingProcessStep: ProcessStepEntity = this.processStepAssemblerService.assembleBottlingProcessStep(
      payload,
      [
        ...batchSelection.batchesForBottle,
        ...persistedConsumedSplitBatches,
      ]
    );
    const persistedBottlingProcessStep: ProcessStepEntity = await this.processStepRepository.insertProcessStep(
      bottlingProcessStep,
    );

    if (payload.files) {
      await Promise.all(
        payload.files.map((file) =>
          this.addDocumentToProcessStep(file, persistedBottlingProcessStep.id, payload.fileDescription),
        ),
      );
    }

    return this.processStepService.readProcessStep(ReadByIdPayload.of(persistedBottlingProcessStep.id));
  }

  private async determineHydrogenComposition(batchAmount: number, hydrogenColor: HydrogenColor, executedById: string): Promise<HydrogenComponentEntity[]> {
    if (hydrogenColor === HydrogenColor.GREEN) {
      return [new HydrogenComponentEntity(HydrogenColor.GREEN, batchAmount)];
    }

    const hydrogenStorageUnit: HydrogenStorageUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, ReadByIdPayload.of(executedById)),
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
    const bottlingProcessStep: ProcessStepEntity = await this.processStepService.readProcessStep(payload);
    return HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep);
  }
}
