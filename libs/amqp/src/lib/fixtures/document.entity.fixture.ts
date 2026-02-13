/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentEntity } from '@h2-trust/amqp';

export const DocumentEntityFixture = {
  create: (overrides: Partial<DocumentEntity> = {}): DocumentEntity =>
    new DocumentEntity(
      overrides.id ?? 'document-1',
      overrides.fileName ?? 'some.pdf',
      overrides.storageUrl ?? 'Test Document',
    ),
} as const;
