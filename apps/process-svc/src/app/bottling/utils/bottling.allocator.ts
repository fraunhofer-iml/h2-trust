/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BatchEntity, BrokerException, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType, ProcessType, RFNBOType } from '@h2-trust/domain';

export interface BottlingAllocation {
  batchesForBottle: BatchEntity[];
  processStepsToBeSplit: ProcessStepEntity[];
  consumedSplitProcessSteps: ProcessStepEntity[];
  processStepsForRemainingAmount: ProcessStepEntity[];
}

export class BottlingAllocator {
  static allocate(
    //All process steps (hydrogen production) of the hydrogen storage unit, i.e. all batches from which the bottling is to be created.
    processSteps: ProcessStepEntity[],
    //The hydrogen compositions to be produced.
    hydrogenComposition: HydrogenComponentEntity[],
    //The ID of the HydrogenStorage unit from which the required bottlings are to be filled.
    hydrogenStorageUnitId: string,
  ): BottlingAllocation {
    const aggregatedBatchesForBottle: BatchEntity[] = [];
    const aggregatedProcessStepsToBeSplit: ProcessStepEntity[] = [];
    const aggregatedConsumedSplitProcessSteps: ProcessStepEntity[] = [];
    const aggregatedProcessStepsForRemainingAmount: ProcessStepEntity[] = [];

    for (const hydrogenComponent of hydrogenComposition) {
      const { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount } =
        BottlingAllocator.processBottlingForEachRFNBO(
          processSteps,
          hydrogenComponent.rfnbo as RFNBOType,
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

  private static processBottlingForEachRFNBO(
    //All process steps (hydrogen production) of the hydrogen storage unit, i.e. all batches from which the bottling is to be created.
    processSteps: ProcessStepEntity[],
    //The RFNBO value of one of the bottlings to be produced
    rfnbo: RFNBOType,
    //Number of units of the bottling to be produced
    amount: number,
    //The hydrogen storage facility from which the bottlings are to be taken.
    hydrogenStorageUnitId: string,
  ): BottlingAllocation {
    //filters out all HydrogenStorage batches that have the same RFNBO status as the filling to be created.
    const processStepsFromHydrogenStorageWithRequestedRFNBOStatus = processSteps.filter(
      (ps) => ps.batch.rfnbo === rfnbo,
    );

    const { selectedProcessSteps, remainingAmount } =
      BottlingAllocator.selectProcessStepsForBottlingAndCalculateRemainingAmount(
        processStepsFromHydrogenStorageWithRequestedRFNBOStatus,
        amount,
        hydrogenStorageUnitId,
        rfnbo,
      );

    return BottlingAllocator.splitLastProcessStepIfNeeded(selectedProcessSteps, remainingAmount);
  }

  private static selectProcessStepsForBottlingAndCalculateRemainingAmount(
    availableProcessSteps: ProcessStepEntity[],
    requestedAmount: number,
    storageUnitId: string,
    rfnbo: string,
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

    const message = `There is not enough hydrogen in storage unit ${storageUnitId} for the requested amount of ${requestedAmount} of quality ${rfnbo}.`;
    throw new BrokerException(message, HttpStatus.BAD_REQUEST);
  }

  private static splitLastProcessStepIfNeeded(
    selectedProcessSteps: ProcessStepEntity[],
    remainingAmount: number,
  ): BottlingAllocation {
    const batchesForBottle: BatchEntity[] = selectedProcessSteps.map((processStep) => processStep.batch);
    const processStepsToBeSplit: ProcessStepEntity[] = [];
    const consumedSplitProcessSteps: ProcessStepEntity[] = [];
    const processStepsForRemainingAmount: ProcessStepEntity[] = [];
    if (remainingAmount > 0) {
      const consumedSplitProcessStep = selectedProcessSteps.at(-1);
      processStepsToBeSplit.push(consumedSplitProcessStep);
      batchesForBottle.pop();

      consumedSplitProcessSteps.push(
        BottlingAllocator.assembleHydrogenProductionProcessStepForRemainingAmount(
          consumedSplitProcessStep,
          consumedSplitProcessStep.batch.amount - remainingAmount,
          false,
        ),
      );

      processStepsForRemainingAmount.push(
        BottlingAllocator.assembleHydrogenProductionProcessStepForRemainingAmount(
          consumedSplitProcessStep,
          remainingAmount,
          true,
        ),
      );
    }
    return { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount };
  }

  // NOTE: The timestamps here were set to those of the “tapped” batch.
  // This places the newly created “remaining” batch at the beginning of the storage batch queue.
  // This seems to contradict the first-in-first-out principle,
  // but in fact a batch is now tapped before all others until it is empty.
  private static assembleHydrogenProductionProcessStepForRemainingAmount(
    predecessorProcessStep: ProcessStepEntity,
    remainingAmount: number,
    active: boolean,
  ): ProcessStepEntity {
    return {
      ...predecessorProcessStep,
      startedAt: predecessorProcessStep.startedAt,
      endedAt: predecessorProcessStep.endedAt,
      type: ProcessType.HYDROGEN_PRODUCTION,
      batch: {
        active: active,
        amount: remainingAmount,
        qualityDetails: {
          color: predecessorProcessStep.batch.qualityDetails.color,
        },
        type: BatchType.HYDROGEN,
        predecessors: [
          {
            id: predecessorProcessStep.batch.id,
          },
        ],
        owner: {
          id: predecessorProcessStep.batch.owner.id,
        },
        hydrogenStorageUnit: {
          id: predecessorProcessStep.batch.hydrogenStorageUnit.id,
        },
      } as BatchEntity,
    } as ProcessStepEntity;
  }
}
