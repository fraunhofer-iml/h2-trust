/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentSeed } from 'libs/database/src/seed';
import { DocumentEntity } from '../document.entity';

export const DocumentEntityMock: DocumentEntity[] = DocumentSeed.map(
  (seed) => new DocumentEntity(seed.id, seed.fileName, seed.transactionHash ?? undefined),
);
