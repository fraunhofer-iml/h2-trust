/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BottlingDto, BottlingOverviewDto } from '@h2-trust/api';
import { prisma } from '../test-utils/test.utils';

export function expectResponseProcessStep(responseProcessStep: BottlingOverviewDto, expectedBottleDto: BottlingDto) {
  expect(responseProcessStep.filledAt).toBe(expectedBottleDto.filledAt);
  expect(responseProcessStep.filledAmount.toString()).toBe(expectedBottleDto.amount);
}

export async function expectProcessStepBeingCreatedInDatabase(responseId: string) {
  expect(
    await prisma.processStep.count({
      where: { id: responseId },
    }),
  ).toBe(1);
}

export async function expectPredecessorsToBeInactive(responseBatchId: string) {
  expect(
    await prisma.batch.count({
      where: {
        successors: {
          some: {
            id: responseBatchId,
          },
        },
        active: false,
      },
    }),
  ).toBe(1);
}

export async function expectRemainingBatchBeingCreatedInDatabase(responseBatchId: string) {
  const lastPredecessorBatch = await prisma.batch.findFirst({
    where: {
      successors: {
        some: {
          id: responseBatchId,
        },
      },
    },
    orderBy: {
      processStep: {
        endedAt: 'desc',
      },
    },
    include: {
      successors: true,
    },
  });
  expect(lastPredecessorBatch.successors.length).toBe(2);
  expect(lastPredecessorBatch.successors.map((batch) => batch.id).includes(responseBatchId)).toBeTruthy();
  const remainingBatchId = lastPredecessorBatch.successors
    .map((batch) => batch.id)
    .find((id) => id !== responseBatchId);
  expect(
    await prisma.batch.count({
      where: {
        id: remainingBatchId,
        active: true,
      },
    }),
  ).toBe(1);
}

export async function expectFileMetadataBeingSavedToDatabase(responseBatchId: string, fileDescription: string) {
  const processStep = await prisma.processStep.findUnique({
    where: {
      id: responseBatchId,
    },
    include: {
      documents: true,
    },
  });
  expect(processStep.documents[0].description).toBe(fileDescription);
}
