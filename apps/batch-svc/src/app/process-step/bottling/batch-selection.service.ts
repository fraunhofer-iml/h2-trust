/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor } from '@h2-trust/api';
import { BatchSelection } from './batch-selection.interface';
import { ProcessStepAssemblerService } from './process-step-assembler.service';

@Injectable()
export class BatchSelectionService {
  constructor(private readonly processStepAssemblerService: ProcessStepAssemblerService) {}

  processBottlingForAllColors(
    allProcessStepsFromStorageUnit: ProcessStepEntity[],
    hydrogenComposition: HydrogenComponentEntity[],
    processStepDataForBottling: ProcessStepEntity,
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
          processStepDataForBottling,
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
    processStepDataForBottling: ProcessStepEntity,
  ): BatchSelection {
    const processStepsFromHydrogenStorageWithRequestedColor = this.filterProcessStepsByColor(
      allProcessStepsFromStorageUnit,
      color,
    );

    const { selectedProcessSteps, remainingAmount } = this.selectProcessStepsForBottlingAndCalculateRemainingAmount(
      processStepsFromHydrogenStorageWithRequestedColor,
      amount,
      processStepDataForBottling.executedBy.id,
      color,
    );

    return this.splitLastProcessStepIfNeeded(selectedProcessSteps, remainingAmount);
  }

  private filterProcessStepsByColor(processSteps: ProcessStepEntity[], color: string): ProcessStepEntity[] {
    return processSteps.filter((processStep) => parseColor(processStep.batch.quality) === color);
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
        this.processStepAssemblerService.assembleHydrogenProductionProcessStepForRemainingAmount(
          consumedSplitProcessStep,
          consumedSplitProcessStep.batch.amount - remainingAmount,
          false,
        ),
      );

      processStepsForRemainingAmount.push(
        this.processStepAssemblerService.assembleHydrogenProductionProcessStepForRemainingAmount(
          consumedSplitProcessStep,
          remainingAmount,
          true,
        ),
      );
    }
    return { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount };
  }
}
