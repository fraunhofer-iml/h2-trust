/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectionDto } from '../section.dto';
import { hydrogenProductionClassificationsMock, powerSupplyClassificationsMock } from './classifications.mock';
import { hydrogenBatchesMock } from './hydrogen-batches.mock';
import { waterBatchMock } from './water-batch.mock';

export const proofOfOriginSectionsMock: SectionDto[] = [
  { name: 'Input Media', batches: [waterBatchMock], classifications: powerSupplyClassificationsMock },
  { name: 'Hydrogen Production', batches: [], classifications: hydrogenProductionClassificationsMock },
  { name: 'Hydrogen Bottling', batches: [hydrogenBatchesMock[3]], classifications: [] },
];
