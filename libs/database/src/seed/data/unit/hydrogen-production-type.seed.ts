/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionType } from '@prisma/client';

export const HydrogenProductionTypeSeed = <HydrogenProductionType[]>[
  {
    id: 'ael',
    method: 'Electrolysis',
    technology: 'Alkaline Electrolysis (AEL)',
  },
  {
    id: 'aem',
    method: 'Electrolysis',
    technology: 'Anion Exchange Membrane (AEM)',
  },
  {
    id: 'pem',
    method: 'Electrolysis',
    technology: 'Proton Exchange Membrane (PEM)',
  },
  {
    id: 'soec',
    method: 'Electrolysis',
    technology: 'Solid Oxide Electrolysis Cell (SOEC)',
  },
];
