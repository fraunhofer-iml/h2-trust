/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { BatchSelection } from './batch-selection.interface';
import { ProcessStepAssembler } from './process-step.assembler';

@Injectable()
export class BatchSelectionService {
  constructor() { }

  processBottlingForAllColors(
    allProcessStepsFromStorageUnit: ProcessStepEntity[],
    hydrogenComposition: HydrogenComponentEntity[],
    hydrogenStorageUnitId: string,
  ): BatchSelection {
    const aggregatedBatchesForBottle: BatchEntity[] = [];
    const aggregatedProcessStepsToBeSplit: ProcessStepEntity[] = [];
    const aggregatedConsumedSplitProcessSteps: ProcessStepEntity[] = [];
    const aggregatedProcessStepsForRemainingAmount: ProcessStepEntity[] = [];

    for (const hydrogenComponent of hydrogenComposition) {
      const { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount } =
        this.processBottlingForEachColor(
          allProcessStepsFromStorageUnit,
          hydrogenComponent.color,
          hydrogenComponent.amount,
          hydrogenStorageUnitId,
        );

      aggregatedBatchesForBottle.push(...batchesForBottle);
      aggregatedProcessStepsToBeSplit.push(...processStepsToBeSplit);
      aggregatedConsumedSplitProcessSteps.push(...consumedSplitProcessSteps);
      aggregatedProcessStepsForRemainingAmount.push(...processStepsForRemainingAmount);
    }

    return {
      batchesForBottle: aggregatedBatchesForBottle,
      processStepsToBeSplit: aggregatedProcessStepsToBeSplit,
      consumedSplitProcessSteps: aggregatedConsumedSplitProcessSteps,
      processStepsForRemainingAmount: aggregatedProcessStepsForRemainingAmount,
    };
  }

  private processBottlingForEachColor(
    allProcessStepsFromStorageUnit: ProcessStepEntity[],
    color: string,
    amount: number,
    hydrogenStorageUnitId: string,
  ): BatchSelection {
    const processStepsFromHydrogenStorageWithRequestedColor = this.filterProcessStepsByColor(
      allProcessStepsFromStorageUnit,
      color,
    );

    const { selectedProcessSteps, remainingAmount } = this.selectProcessStepsForBottlingAndCalculateRemainingAmount(
      processStepsFromHydrogenStorageWithRequestedColor,
      amount,
      hydrogenStorageUnitId,
      color,
    );

    return this.splitLastProcessStepIfNeeded(selectedProcessSteps, remainingAmount);
  }

  private filterProcessStepsByColor(processSteps: ProcessStepEntity[], color: string): ProcessStepEntity[] {
    return processSteps.filter((processStep) => processStep.batch.qualityDetails.color === color);
  }

  private selectProcessStepsForBottlingAndCalculateRemainingAmount(
    availableProcessSteps: ProcessStepEntity[],
    requestedAmount: number,
    storageUnitId: string,
    color: string,
  ): { selectedProcessSteps: ProcessStepEntity[]; remainingAmount: number } {
    const selectedProcessSteps: ProcessStepEntity[] = [];
    let pendingAmount = requestedAmount;

    for (const currentProcessStep of availableProcessSteps) {
      selectedProcessSteps.push(currentProcessStep);

      if (currentProcessStep.batch.amount >= pendingAmount) {
        const remainingAmount = currentProcessStep.batch.amount - pendingAmount;
        return { selectedProcessSteps, remainingAmount };
      }

      pendingAmount -= currentProcessStep.batch.amount;
    }

    const message = `There is not enough hydrogen in storage unit ${storageUnitId} for the requested amount of ${requestedAmount} of quality ${color}.`;
    throw new BrokerException(message, HttpStatus.BAD_REQUEST);
  }

  private splitLastProcessStepIfNeeded(
    selectedProcessSteps: ProcessStepEntity[],
    remainingAmount: number,
  ): BatchSelection {
    const batchesForBottle: BatchEntity[] = selectedProcessSteps.map((processStep) => processStep.batch);
    const processStepsToBeSplit: ProcessStepEntity[] = [];
    const consumedSplitProcessSteps: ProcessStepEntity[] = [];
    const processStepsForRemainingAmount: ProcessStepEntity[] = [];
    if (remainingAmount > 0) {
      const consumedSplitProcessStep = selectedProcessSteps.at(-1);
      processStepsToBeSplit.push(consumedSplitProcessStep);
      batchesForBottle.pop();

      consumedSplitProcessSteps.push(
        ProcessStepAssembler.assembleHydrogenProductionProcessStepForRemainingAmount(
          consumedSplitProcessStep,
          consumedSplitProcessStep.batch.amount - remainingAmount,
          false,
        ),
      );

      processStepsForRemainingAmount.push(
        ProcessStepAssembler.assembleHydrogenProductionProcessStepForRemainingAmount(
          consumedSplitProcessStep,
          remainingAmount,
          true,
        ),
      );
    }
    return { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount };
  }
}
