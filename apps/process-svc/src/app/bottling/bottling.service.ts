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
import { HydrogenComponentDto } from '@h2-trust/api';
import { DocumentRepository } from '@h2-trust/database';
import { HydrogenColor, RFNBOType } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { DigitalProductPassportCalculationService } from '../digital-product-passport/digital-product-passport.calculation.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { BottlingProcessStepAssembler } from './utils/bottling-process-step.assembler';
import { BottlingAllocation, BottlingAllocator } from './utils/bottling.allocator';

@Injectable()
export class BottlingService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly storageService: StorageService,
    private readonly documentRepository: DocumentRepository,
    private readonly processStepService: ProcessStepService,
    private readonly digitalProductPassportCalculationService: DigitalProductPassportCalculationService,
  ) {}

  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    //These are the current fillings of the selected hydrogen storage.
    const allProcessStepsFromStorageUnit: ProcessStepEntity[] =
      await this.processStepService.readAllProcessStepsFromStorageUnit(payload.hydrogenStorageUnitId);

    const batchIdToRfnboStatus: Map<string, RFNBOType> = new Map();
    for (let i = 0; i < allProcessStepsFromStorageUnit.length; i++) {
      const fillingWithRFNBO: HydrogenComponentDto =
        await this.digitalProductPassportCalculationService.getDPPForFilling(allProcessStepsFromStorageUnit[i]);
      batchIdToRfnboStatus.set(
        allProcessStepsFromStorageUnit[i].batch.id,
        fillingWithRFNBO.rfnbo.rfnboReady ? RFNBOType.RFNBO_READY : RFNBOType.NON_CERTIFIABLE,
      );
    }

    if (allProcessStepsFromStorageUnit.length === 0) {
      throw new BrokerException(
        `No process steps found in storage unit ${payload.hydrogenStorageUnitId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //These are the required HydrogenComponents, i.e. the fillings that are needed and that are to be tapped.
    const hydrogenComposition: HydrogenComponentEntity[] = await this.determineHydrogenComposition(
      payload.amount,
      payload.rfnboReady,
      payload.hydrogenStorageUnitId,
    );

    const allocation: BottlingAllocation = BottlingAllocator.allocate(
      batchIdToRfnboStatus,
      allProcessStepsFromStorageUnit,
      hydrogenComposition,
      payload.hydrogenStorageUnitId,
    );

    //Since the allocation is independent of colour or RFNBO status, no adjustment should be necessary after the allocation has been created.

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
    rfnboReady: RFNBOType,
    executedById: string,
  ): Promise<HydrogenComponentEntity[]> {
    //If RFNBO type RFNBO_READY is selected, then only one large filling is required, so there is only one element in the list.
    if (rfnboReady === RFNBOType.RFNBO_READY) {
      return [new HydrogenComponentEntity('', HydrogenColor.GREEN, batchAmount, RFNBOType.RFNBO_READY)];
    }

    const hydrogenStorageUnit: HydrogenStorageUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(executedById)),
    );

    try {
      //If RFNBO Type NON_CERTIFIED is selected, then all fillings of the StorageUnit are taken and the appropriate quantity of units to be used is determined in order to ensure uniform emptying when green hydrogen is required.
      return HydrogenCompositionUtil.computeHydrogenComposition(hydrogenStorageUnit.filling, batchAmount);
    } catch (BrokerException) {
      throw new BrokerException(
        `Total stored amount of ${hydrogenStorageUnit.id} is not greater than 0`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async addDocumentToProcessStep(file: Express.Multer.File, processStepId: string): Promise<DocumentEntity> {
    await this.storageService.uploadFile(file.originalname, Buffer.from(file.buffer));

    return this.documentRepository.addDocumentToProcessStep(
      new DocumentEntity(undefined, file.originalname),
      processStepId,
    );
  }
}
