/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { BrokerException, HydrogenComponentEntity, ProcessStepEntity, ReadByIdPayload } from '@h2-trust/amqp';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step.service';
import { BatchSelection } from './batch-selection.interface';
import { BatchSelectionService } from './batch-selection.service';
import { HydrogenComponentAssembler } from './hydrogen-component-assembler';
import { HydrogenCompositionService } from './hydrogen-composition.service';
import { ProcessStepAssemblerService } from './process-step-assembler.service';

@Injectable()
export class BottlingService {
  constructor(
    private readonly hydrogenCompositionService: HydrogenCompositionService,
    private readonly batchSelectionService: BatchSelectionService,
    private readonly processStepAssemblerService: ProcessStepAssemblerService,
    private readonly storageService: StorageService,
    private readonly processStepRepository: ProcessStepRepository,
    private readonly batchRepository: BatchRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepService: ProcessStepService,
  ) {}

  async createHydrogenBottlingProcessStep(
    processStep: ProcessStepEntity,
    files: Express.Multer.File[],
  ): Promise<ProcessStepEntity> {
    const allProcessStepsFromStorageUnit = await this.processStepRepository.findAllProcessStepsFromStorageUnit(
      processStep.executedBy.id,
    );

    if (allProcessStepsFromStorageUnit.length === 0) {
      throw new BrokerException(
        `No batches found in storage unit ${processStep.executedBy.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hydrogenComposition = await this.hydrogenCompositionService.determineHydrogenComposition(processStep);

    const batchSelection: BatchSelection = this.batchSelectionService.processBottlingForAllColors(
      allProcessStepsFromStorageUnit,
      hydrogenComposition,
      processStep,
    );

    const batchesToSetInactive = [
      ...batchSelection.batchesForBottle,
      ...batchSelection.processStepsToBeSplit.map((processStep) => processStep.batch),
    ];
    await this.batchRepository.setBatchesInactive(batchesToSetInactive.map((batch) => batch.id));

    const createdConsumedSplitProcessSteps = await Promise.all(
      batchSelection.consumedSplitProcessSteps.map((processStep) =>
        this.processStepRepository.insertProcessStep(processStep),
      ),
    );
    const createdConsumedSplitBatches = createdConsumedSplitProcessSteps.map((processStep) => processStep.batch);

    await Promise.all(
      batchSelection.processStepsForRemainingAmount.map((processStep) =>
        this.processStepRepository.insertProcessStep(processStep),
      ),
    );

    const bottlingProcessStep = await this.processStepAssemblerService.createBottlingProcessStep(processStep, [
      ...batchSelection.batchesForBottle,
      ...createdConsumedSplitBatches,
    ]);

    if (files) {
      await Promise.all(
        files.map((file) =>
          this.addDocumentToProcessStep(file, bottlingProcessStep.id, processStep.documents[0]?.description),
        ),
      );
    }

    return this.processStepService.readProcessStep(ReadByIdPayload.of(bottlingProcessStep.id));
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

  async calculateHydrogenComposition(bottlingProcessStepId: string): Promise<HydrogenComponentEntity[]> {
    const bottlingProcessStep: ProcessStepEntity = await this.processStepService.readProcessStep(ReadByIdPayload.of(bottlingProcessStepId));
    return HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep);
  }
}
