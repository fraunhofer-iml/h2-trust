/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProductionDto } from '../create-production.dto';

export const CreateProductionDtoMock = <CreateProductionDto>{
  productionStartedAt: new Date('2025-01-01T10:00:00Z'),
  productionEndedAt: new Date('2025-01-01T10:10:00Z'),
  powerProductionUnitId: 'power-production-unit-1',
  powerAmountKwh: 10,
  hydrogenProductionUnitId: 'hydrogen-production-unit-1',
  hydrogenAmountKg: 5,
};
