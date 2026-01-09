/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BatchEntity, BrokerException, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessStepAssembler } from './process-step.assembler';

export interface BatchSelectionResult {
  batchesForBottle: BatchEntity[];
  processStepsToBeSplit: ProcessStepEntity[];
  consumedSplitProcessSteps: ProcessStepEntity[];
  processStepsForRemainingAmount: ProcessStepEntity[];
}

export class BatchSelector {
  static processBottlingForAllColors(
    processSteps: ProcessStepEntity[],
    hydrogenComposition: HydrogenComponentEntity[],
    hydrogenStorageUnitId: string,
  ): BatchSelectionResult {
    const aggregatedBatchesForBottle: BatchEntity[] = [];
    const aggregatedProcessStepsToBeSplit: ProcessStepEntity[] = [];
    const aggregatedConsumedSplitProcessSteps: ProcessStepEntity[] = [];
    const aggregatedProcessStepsForRemainingAmount: ProcessStepEntity[] = [];

    for (const hydrogenComponent of hydrogenComposition) {
      const { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount } =
        BatchSelector.processBottlingForEachColor(
          processSteps,
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

  private static processBottlingForEachColor(
    processSteps: ProcessStepEntity[],
    color: string,
    amount: number,
    hydrogenStorageUnitId: string,
  ): BatchSelectionResult {
    const processStepsFromHydrogenStorageWithRequestedColor = processSteps.filter(
      (ps) => ps.batch.qualityDetails.color === color
    )

    const { selectedProcessSteps, remainingAmount } = BatchSelector.selectProcessStepsForBottlingAndCalculateRemainingAmount(
      processStepsFromHydrogenStorageWithRequestedColor,
      amount,
      hydrogenStorageUnitId,
      color,
    );

    return BatchSelector.splitLastProcessStepIfNeeded(selectedProcessSteps, remainingAmount);
  }

  private static selectProcessStepsForBottlingAndCalculateRemainingAmount(
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

  private static splitLastProcessStepIfNeeded(
    selectedProcessSteps: ProcessStepEntity[],
    remainingAmount: number,
  ): BatchSelectionResult {
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
