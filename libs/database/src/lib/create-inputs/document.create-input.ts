/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { DocumentEntity } from '@h2-trust/amqp';

export function buildDocumentCreateInput(document: DocumentEntity, processStepId: string): Prisma.DocumentCreateInput {
  return Prisma.validator<Prisma.DocumentCreateInput>()({
    description: document.description ?? '',
    location: document.location,
    processStep: {
      connect: {
        id: processStepId,
      },
    },
  });
}
