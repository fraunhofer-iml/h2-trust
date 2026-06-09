/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, HydrogenComponentEntity, ProcessStepEntity } from '@h2-trust/contracts/entities';
import { BatchType, ProcessType, RfnboType } from '@h2-trust/domain';
import { DomainException, ErrorCode } from '@h2-trust/exceptions';
import { assertDefined } from '@h2-trust/utils';

export interface BottlingAllocation {
  batchesForBottle: BatchEntity[];
  processStepsToBeSplit: ProcessStepEntity[];
  consumedSplitProcessSteps: ProcessStepEntity[];
  processStepsForRemainingAmount: ProcessStepEntity[];
}

/**
 * @param processSteps All process steps (hydrogen production) of the hydrogen storage unit, i.e. all batches from which the bottling is to be created.
 * @param hydrogenComposition The hydrogen compositions to be produced.
 * @param hydrogenStorageUnitId The ID of the HydrogenStorage unit from which the required bottlings are to be filled.
 */
export function allocateBottling(
  processSteps: ProcessStepEntity[],
  hydrogenComposition: HydrogenComponentEntity[],
  hydrogenStorageUnitId: string,
): BottlingAllocation {
  const aggregatedBatchesForBottle: BatchEntity[] = [];
  const aggregatedProcessStepsToBeSplit: ProcessStepEntity[] = [];
  const aggregatedConsumedSplitProcessSteps: ProcessStepEntity[] = [];
  const aggregatedProcessStepsForRemainingAmount: ProcessStepEntity[] = [];

  for (const hydrogenComponent of hydrogenComposition) {
    const { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount } =
      processBottlingForEachRfnboType(
        processSteps,
        hydrogenComponent.rfnboType,
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

/**
 * @param processSteps All process steps (hydrogen production) of the hydrogen storage unit, i.e. all batches from which the bottling is to be created.
 * @param rfnboType The RFNBO type of one of the bottlings to be produced
 * @param amount Number of units of the bottling to be produced
 * @param hydrogenStorageUnitId The hydrogen storage facility from which the bottlings are to be taken.
 */
function processBottlingForEachRfnboType(
  processSteps: ProcessStepEntity[],
  rfnboType: RfnboType,
  amount: number,
  hydrogenStorageUnitId: string,
): BottlingAllocation {
  const processStepsFromHydrogenStorageWithRequestedRFNBOType = processSteps.filter(
    (ps) => ps.batch.qualityDetails.rfnboType === rfnboType,
  );

  const { selectedProcessSteps, remainingAmount } = selectProcessStepsForBottlingAndCalculateRemainingAmount(
    processStepsFromHydrogenStorageWithRequestedRFNBOType,
    amount,
    hydrogenStorageUnitId,
    rfnboType,
  );

  return splitLastProcessStepIfNeeded(selectedProcessSteps, remainingAmount);
}

function selectProcessStepsForBottlingAndCalculateRemainingAmount(
  availableProcessSteps: ProcessStepEntity[],
  requestedAmount: number,
  storageUnitId: string,
  rfnboType: RfnboType,
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

  throw new DomainException(
    ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
    `There is not enough hydrogen in storage unit '${storageUnitId}' for the requested amount of ${requestedAmount} of quality ${rfnboType}.`,
  );
}

function splitLastProcessStepIfNeeded(
  selectedProcessSteps: ProcessStepEntity[],
  remainingAmount: number,
): BottlingAllocation {
  const batchesForBottle: BatchEntity[] = selectedProcessSteps.map((processStep) => processStep.batch);
  const processStepsToBeSplit: ProcessStepEntity[] = [];
  const consumedSplitProcessSteps: ProcessStepEntity[] = [];
  const processStepsForRemainingAmount: ProcessStepEntity[] = [];
  if (remainingAmount > 0) {
    const consumedSplitProcessStep = selectedProcessSteps.at(-1);
    assertDefined(consumedSplitProcessStep, 'consumedSplitProcessStep');
    processStepsToBeSplit.push(consumedSplitProcessStep);
    batchesForBottle.pop();

    consumedSplitProcessSteps.push(
      assembleHydrogenProductionProcessStepForRemainingAmount(
        consumedSplitProcessStep,
        consumedSplitProcessStep.batch.amount - remainingAmount,
        false,
      ),
    );

    processStepsForRemainingAmount.push(
      assembleHydrogenProductionProcessStepForRemainingAmount(consumedSplitProcessStep, remainingAmount, true),
    );
  }
  return { batchesForBottle, processStepsToBeSplit, consumedSplitProcessSteps, processStepsForRemainingAmount };
}

// NOTE: The timestamps here were set to those of the “tapped” batch.
// This places the newly created “remaining” batch at the beginning of the storage batch queue.
// This seems to contradict the first-in-first-out principle,
// but in fact a batch is now tapped before all others until it is empty.
function assembleHydrogenProductionProcessStepForRemainingAmount(
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
        rfnboType: predecessorProcessStep.batch.qualityDetails.rfnboType,
        powerType: predecessorProcessStep.batch.qualityDetails.powerType,
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
    } as BatchEntity,
  } as ProcessStepEntity;
}
