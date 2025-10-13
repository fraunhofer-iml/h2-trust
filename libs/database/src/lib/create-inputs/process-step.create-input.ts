/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BatchType, Prisma } from '@prisma/client';
import { BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';

export function buildProcessStepCreateInput(processStep: ProcessStepEntity): Prisma.ProcessStepCreateInput {
  if (processStep.processType === ProcessType.POWER_PRODUCTION && processStep.batch?.hydrogenStorageUnit?.id) {
    throw new BrokerException(
      `Power production batch with amount [${processStep.batch?.amount}] has a hydrogen storage unit [${processStep.batch.hydrogenStorageUnit.id}]`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (processStep.processType === ProcessType.HYDROGEN_PRODUCTION && !processStep.batch?.hydrogenStorageUnit?.id) {
    throw new BrokerException(
      `Hydrogen production batch with amount [${processStep.batch?.amount}] has no hydrogen storage unit`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (processStep.processType === ProcessType.HYDROGEN_BOTTLING && processStep.batch?.hydrogenStorageUnit?.id) {
    throw new BrokerException(
      `Hydrogen bottling batch with amount [${processStep.batch?.amount}] has a hydrogen storage unit [${processStep.batch.hydrogenStorageUnit.id}]`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  if (!processStep.batch) {
    throw new BrokerException('ProcessStepEntity.batch was undefined', HttpStatus.BAD_REQUEST);
  }

  if (!processStep.batch.amount) {
    throw new BrokerException('ProcessStepEntity.batch.amount was undefined', HttpStatus.BAD_REQUEST);
  }

  if (!processStep.batch.predecessors) {
    processStep.batch.predecessors = [];
  }

  return Prisma.validator<Prisma.ProcessStepCreateInput>()({
    startedAt: processStep.startedAt,
    endedAt: processStep.endedAt,
    processType: {
      connect: {
        name: processStep.processType,
      },
    },
    batch: {
      create: {
        active: processStep.batch.active ?? true,
        amount: processStep.batch.amount,
        quality: processStep.batch.quality ?? '{}',
        type: BatchType[processStep.batch.type as keyof typeof BatchType],

        owner: {
          connect: {
            id: processStep.batch.owner?.id,
          },
        },
        predecessors: {
          connect: processStep.batch.predecessors.map((batch) => {
            return { id: batch.id };
          }),
        },
        ...(processStep.batch.hydrogenStorageUnit?.id && {
          hydrogenStorageUnit: {
            connect: {
              id: processStep.batch.hydrogenStorageUnit.id,
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
              transportMode: {
                connect: {
                  name: processStep.transportationDetails.transportMode,
                },
              },
              ...(processStep.transportationDetails.fuelType && {
                fuelType: {
                  connect: {
                    name: processStep.transportationDetails.fuelType,
                  },
                },
              }),
            },
          },
        },
      },
    }),
  });
}
