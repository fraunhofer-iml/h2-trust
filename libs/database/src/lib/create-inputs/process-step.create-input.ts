/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { BatchType } from '@h2-trust/domain';

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
        ...(processStep.batch.qualityDetails && {
          batchDetails: {
            create: {
              qualityDetails: {
                create: {
                  rfnboType: processStep.batch.qualityDetails.rfnboType,
                  powerType: processStep.batch.qualityDetails.powerType,
                  distance: processStep.batch.qualityDetails.distance,
                },
              },
            },
          },
        }),
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
