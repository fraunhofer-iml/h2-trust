/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnumLabelMapper } from '../../../../labels';
import { BatchType } from '@h2-trust/domain';
import { WaterBatchDto } from '../water-batch.dto';
import { WaterDetailsDto } from '../water-details.dto';
import { EmissionMock } from './emissions.mock';

const waterDetailsMock: WaterDetailsDto[] = [
  {
    amount: 100,
    emission: { amountCO2: 50, amountCO2PerKgH2: 8.7, basisOfCalculation: [' E =  n * 0.43 '] },
  },
];

export const waterBatchMock: WaterBatchDto = {
  id: 'water-batch-1',
  amount: 300,
  unit: EnumLabelMapper.getMeasurementUnit(BatchType.WATER),
  createdAt: new Date(),
  deionizedWater: waterDetailsMock[0],
  emission: EmissionMock,
  batchType: BatchType.WATER,
};
