/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BatchEntity,
  BrokerException,
  CompanyEntity,
  CreateHydrogenBottlingPayload,
  HydrogenComponentEntity,
  ProcessStepEntity,
  QualityDetailsEntity,
  ReadByIdPayload,
} from '@h2-trust/amqp';
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

  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    const processStep = this.toProcessStepEntity(payload);

    const allProcessStepsFromStorageUnit = await this.processStepRepository.findAllProcessStepsFromStorageUnit(
      payload.hydrogenStorageUnitId,
    );

    if (allProcessStepsFromStorageUnit.length === 0) {
      throw new BrokerException(
        `No batches found in storage unit ${payload.hydrogenStorageUnitId}`,
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
      ...batchSelection.processStepsToBeSplit.map((ps) => ps.batch),
    ];
    await this.batchRepository.setBatchesInactive(batchesToSetInactive.map((batch) => batch.id));

    const createdConsumedSplitProcessSteps = await Promise.all(
      batchSelection.consumedSplitProcessSteps.map((step) => this.processStepRepository.insertProcessStep(step)),
    );
    const createdConsumedSplitBatches = createdConsumedSplitProcessSteps.map((ps) => ps.batch);

    await Promise.all(
      batchSelection.processStepsForRemainingAmount.map((ps) => this.processStepRepository.insertProcessStep(ps)),
    );

    const bottlingProcessStep = await this.processStepAssemblerService.createBottlingProcessStep(processStep, [
      ...batchSelection.batchesForBottle,
      ...createdConsumedSplitBatches,
    ]);

    if (payload.files) {
      await Promise.all(
        payload.files.map((file) =>
          this.addDocumentToProcessStep(file, bottlingProcessStep.id, payload.fileDescription),
        ),
      );
    }

    return this.processStepService.readProcessStep(ReadByIdPayload.of(bottlingProcessStep.id));
  }

  private toProcessStepEntity(payload: CreateHydrogenBottlingPayload): ProcessStepEntity {
    return <ProcessStepEntity>{
      startedAt: payload.filledAt,
      endedAt: payload.filledAt,
      batch: <BatchEntity>{
        amount: payload.amount,
        owner: <CompanyEntity>{
          id: payload.ownerId,
        },
        qualityDetails: <QualityDetailsEntity>{
          color: payload.color,
        },
      },
      recordedBy: {
        id: payload.recordedById,
      },
      executedBy: {
        id: payload.hydrogenStorageUnitId,
      },
      documents: payload.fileDescription ? [{ description: payload.fileDescription }] : [],
    };
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
