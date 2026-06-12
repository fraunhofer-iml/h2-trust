/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { BatchType, PowerType, RfnboType } from '@h2-trust/domain';

export function buildProcessStepCreateInput(processStep: ProcessStepEntity): Prisma.ProcessStepCreateInput {
  const predecessors = processStep.batch.predecessors ?? [];

  return Prisma.validator<Prisma.ProcessStepCreateInput>()({
    startedAt: processStep.startedAt,
    endedAt: processStep.endedAt,
    type: processStep.type,
    batch: {
      create: {
        active: processStep.batch.active ?? true,
        amount: processStep.batch.amount,
        qualityDetails: {
          create: {
            rfnboType: processStep.batch.qualityDetails?.rfnboType ?? RfnboType.NOT_SPECIFIED,
            productionPowerType: processStep.batch.qualityDetails?.productionPowerType ?? PowerType.NOT_SPECIFIED,
            usedRenewablePower: processStep.batch.qualityDetails?.usedRenewablePower,
            usedGridPower: processStep.batch.qualityDetails?.usedGridPower,
            distance: processStep.batch.qualityDetails?.distance,
            wasteWater: processStep.batch.qualityDetails?.wasteWater,
            resinConsumption: processStep.batch.qualityDetails?.resinConsumption,
            compressedAir: processStep.batch.qualityDetails?.compressedAir,
            nitrogenConsumption: processStep.batch.qualityDetails?.nitrogenConsumption,
          },
        },
        type: BatchType[processStep.batch.type as keyof typeof BatchType],

        owner: {
          connect: {
            id: processStep.batch.owner?.id,
          },
        },
        predecessors: {
          connect: predecessors.map((batch) => {
            return { id: batch.id };
          }),
        },
      },
    },
    recordedBy: {
      connect: {
        id: processStep.recordedBy?.id,
      },
    },
    executedBy: {
      connect: {
        id: processStep.executedBy?.id,
      },
    },
  });
}
