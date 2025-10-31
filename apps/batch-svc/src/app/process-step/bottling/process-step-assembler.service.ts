/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchEntity, BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor } from '@h2-trust/api';
import { ProcessStepRepository } from '@h2-trust/database';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';

@Injectable()
export class ProcessStepAssemblerService {
  constructor(private readonly processStepRepository: ProcessStepRepository) {}

  async createBottlingProcessStep(
    processStep: ProcessStepEntity,
    batchesForBottle: BatchEntity[],
  ): Promise<ProcessStepEntity> {
    return this.processStepRepository.insertProcessStep({
      ...processStep,
      type: ProcessType.HYDROGEN_BOTTLING,
      batch: {
        amount: processStep.batch.amount,
        quality: this.determineBottleQualityFromPredecessors(batchesForBottle),
        type: BatchType.HYDROGEN,
        predecessors: batchesForBottle.map((batch) => ({
          id: batch.id,
        })),
        owner: {
          id: processStep.batch.owner.id,
        },
      },
    });
  }

  private determineBottleQualityFromPredecessors(predecessors: BatchEntity[]): string {
    const colors: HydrogenColor[] = predecessors
      .map((batch) => batch.quality)
      .map(parseColor)
      .map((color) => HydrogenColor[color as keyof typeof HydrogenColor]);
    return JSON.stringify({
      color: this.determineBottleColorFromPredecessors(colors),
    });
  }

  private determineBottleColorFromPredecessors(colors: HydrogenColor[]): HydrogenColor {
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
        quality: predecessorProcessStep.batch.quality,
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
      },
    };
  }
}
