/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentSeed } from '../../../seed';
import { DocumentDbType } from '../document.db.type';

export const DocumentDbTypeMock = <DocumentDbType[]>[
  {
    ...DocumentSeed[0],
  },
];
