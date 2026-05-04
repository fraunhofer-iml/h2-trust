/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource, MeasurementUnit } from '@h2-trust/domain';
import { ClassificationDto } from '../classification.dto';
import { hydrogenBatchesMock } from './hydrogen-batches.mock';
import { PowerBatchesMock } from './power-batches.mock';

export const powerTypeClassificationsMock: ClassificationDto[] = [
  {
    amount: 60,
    batches: [PowerBatchesMock[0], PowerBatchesMock[1]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: EnergySource.WIND_ENERGY,
    classificationType: BatchType.POWER,
    unit: MeasurementUnit.KWH,
  },
  {
    amount: 60,
    batches: [PowerBatchesMock[2], PowerBatchesMock[3]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: EnergySource.SOLAR_ENERGY,
    classificationType: BatchType.POWER,
    unit: MeasurementUnit.KWH,
  },
];

export const powerSupplyClassificationsMock: ClassificationDto[] = [
  {
    amount: 60,
    batches: [],
    classifications: powerTypeClassificationsMock,
    emissionOfProcessStep: 260,
    name: 'POWER SUPPLY',
    classificationType: BatchType.POWER,
    unit: MeasurementUnit.KWH,
  },
];

export const hydrogenProductionClassificationsMock: ClassificationDto[] = [
  {
    amount: 400,
    batches: [hydrogenBatchesMock[0], hydrogenBatchesMock[1]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: 'test1',
    classificationType: BatchType.HYDROGEN,
    unit: MeasurementUnit.KG,
  },
  {
    amount: 300,
    batches: [hydrogenBatchesMock[2]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: 'test2',
    classificationType: BatchType.HYDROGEN,
    unit: MeasurementUnit.KG,
  },
];
