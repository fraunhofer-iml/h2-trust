/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';

export function buildProcessStepCreateInput(processStep: ProcessStepEntity): Prisma.ProcessStepCreateInput {
  const hydrogenStorageUnitId = processStep.batch.hydrogenStorageUnit?.id;

  if (processStep.type === ProcessType.POWER_PRODUCTION && hydrogenStorageUnitId) {
    throw new InternalException(
      `Power production batch with amount [${processStep.batch.amount}] has a hydrogen storage unit [${hydrogenStorageUnitId}]`,
    );
  }

  if (processStep.type === ProcessType.HYDROGEN_PRODUCTION && !hydrogenStorageUnitId) {
    throw new InternalException(
      `Hydrogen production batch with amount [${processStep.batch.amount}] has no hydrogen storage unit`,
    );
  }

  if (processStep.type === ProcessType.HYDROGEN_BOTTLING && hydrogenStorageUnitId) {
    throw new InternalException(
      `Hydrogen bottling batch with amount [${processStep.batch.amount}] has a hydrogen storage unit [${hydrogenStorageUnitId}]`,
    );
  }

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
        ...(hydrogenStorageUnitId && {
          hydrogenStorageUnit: {
            connect: {
              id: hydrogenStorageUnitId,
            },
          },
        }),
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
    ...(processStep.transportationDetails && {
      processStepDetails: {
        create: {
          transportationDetails: {
            create: {
              distance: processStep.transportationDetails.distance,
              transportMode: processStep.transportationDetails.transportMode,
              fuelType: processStep.transportationDetails.fuelType ?? null,
            },
          },
        },
      },
    }),
  });
}
