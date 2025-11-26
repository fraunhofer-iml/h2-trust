/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { assertDefined } from '@h2-trust/utils';

export function buildProcessStepCreateInput(processStep: ProcessStepEntity): Prisma.ProcessStepCreateInput {
  assertDefined(processStep.batch, 'ProcessStepEntity.batch');
  assertDefined(processStep.batch.amount, 'ProcessStepEntity.batch.amount');
  assertDefined(processStep.type, 'ProcessStepEntity.type');

  const hydrogenStorageUnitId = processStep.batch.hydrogenStorageUnit?.id;

  if (processStep.type === ProcessType.POWER_PRODUCTION && hydrogenStorageUnitId) {
    throw new BrokerException(
      `Power production batch with amount [${processStep.batch.amount}] has a hydrogen storage unit [${hydrogenStorageUnitId}]`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (processStep.type === ProcessType.HYDROGEN_PRODUCTION && !hydrogenStorageUnitId) {
    throw new BrokerException(
      `Hydrogen production batch with amount [${processStep.batch.amount}] has no hydrogen storage unit`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (processStep.type === ProcessType.HYDROGEN_BOTTLING && hydrogenStorageUnitId) {
    throw new BrokerException(
      `Hydrogen bottling batch with amount [${processStep.batch.amount}] has a hydrogen storage unit [${hydrogenStorageUnitId}]`,
      HttpStatus.INTERNAL_SERVER_ERROR,
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
        ...(processStep.batch.qualityDetails?.color && {
          batchDetails: {
            create: {
              qualityDetails: {
                create: {
                  color: processStep.batch.qualityDetails.color,
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
