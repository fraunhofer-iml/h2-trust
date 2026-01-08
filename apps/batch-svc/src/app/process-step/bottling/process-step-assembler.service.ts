/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, CreateHydrogenBottlingPayload, ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';

@Injectable()
export class ProcessStepAssemblerService {
  assembleBottlingProcessStep(
    payload: CreateHydrogenBottlingPayload,
    batchesForBottle: BatchEntity[],
  ): ProcessStepEntity {
    return {
      startedAt: payload.filledAt,
      endedAt: payload.filledAt,
      type: ProcessType.HYDROGEN_BOTTLING,
      batch: {
        amount: payload.amount,
        qualityDetails: {
          color: this.determineBottleQualityFromPredecessors(batchesForBottle),
        },
        type: BatchType.HYDROGEN,
        predecessors: batchesForBottle.map(
          (batch) => ({
            id: batch.id,
          }),
        ) as BatchEntity[],
        owner: { id: payload.ownerId },
      } as BatchEntity,
      recordedBy: { id: payload.recordedById },
      executedBy: { id: payload.hydrogenStorageUnitId },
    } as ProcessStepEntity;
  }

  private determineBottleQualityFromPredecessors(predecessors: BatchEntity[]): HydrogenColor {
    const colors: HydrogenColor[] = predecessors
      .map((batch) => batch.qualityDetails?.color)
      .map((color) => HydrogenColor[color as keyof typeof HydrogenColor]);

    if (colors.length === 0) {
      throw new BrokerException(`No predecessor colors specified`, HttpStatus.BAD_REQUEST);
    }

    const firstColor = colors[0];
    const allColorsAreEqual = colors.every((color) => color === firstColor);

    return allColorsAreEqual ? firstColor : HydrogenColor.MIX;
  }

  // NOTE: The timestamps here were set to those of the “tapped” batch.
  // This places the newly created “remaining” batch at the beginning of the storage batch queue.
  // This seems to contradict the first-in-first-out principle,
  // but in fact a batch is now tapped before all others until it is empty.
  assembleHydrogenProductionProcessStepForRemainingAmount(
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
