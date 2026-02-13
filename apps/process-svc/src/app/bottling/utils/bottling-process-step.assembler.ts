/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BatchEntity, BrokerException, CreateHydrogenBottlingPayload, ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType, HydrogenColor, ProcessType } from '@h2-trust/domain';

export class BottlingProcessStepAssembler {
  static assemble(payload: CreateHydrogenBottlingPayload, batchesForBottle: BatchEntity[]): ProcessStepEntity {
    return {
      startedAt: payload.filledAt,
      endedAt: payload.filledAt,
      type: ProcessType.HYDROGEN_BOTTLING,
      batch: {
        amount: payload.amount,
        qualityDetails: {
          color: BottlingProcessStepAssembler.determineBottleQualityFromPredecessors(batchesForBottle),
        },
        type: BatchType.HYDROGEN,
        predecessors: batchesForBottle.map((batch) => ({
          id: batch.id,
        })) as BatchEntity[],
        owner: { id: payload.ownerId },
      } as BatchEntity,
      recordedBy: { id: payload.recordedById },
      executedBy: { id: payload.hydrogenStorageUnitId },
    } as ProcessStepEntity;
  }

  private static determineBottleQualityFromPredecessors(predecessors: BatchEntity[]): HydrogenColor {
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
}
