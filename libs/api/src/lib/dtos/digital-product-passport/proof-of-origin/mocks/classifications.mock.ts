/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource, HydrogenColor, MeasurementUnit } from '@h2-trust/domain';
import { ClassificationDto } from '../classification.dto';
import { hydrogenBatchesMock } from './hydrogen-batches.mock';
import { PowerBatchesMock } from './power-batches.mock';

export const powerTypeClassificationsMock: ClassificationDto[] = [
  {
    amount: 60,
    amountVerified: 30,
    batches: [PowerBatchesMock[0], PowerBatchesMock[1]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: EnergySource.WIND_ENERGY,
    classificationType: BatchType.POWER,
    unit: MeasurementUnit.POWER,
  },
  {
    amount: 60,
    amountVerified: 30,
    batches: [PowerBatchesMock[2], PowerBatchesMock[3]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: EnergySource.SOLAR_ENERGY,
    classificationType: BatchType.POWER,
    unit: MeasurementUnit.POWER,
  },
];

export const powerSupplyClassificationsMock: ClassificationDto[] = [
  {
    amount: 60,
    amountVerified: 30,
    batches: [],
    classifications: powerTypeClassificationsMock,
    emissionOfProcessStep: 260,
    name: 'POWER SUPPLY',
    classificationType: BatchType.POWER,
    unit: MeasurementUnit.POWER,
  },
];

export const hydrogenColorClassificationsMock: ClassificationDto[] = [
  {
    amount: 400,
    amountVerified: 400,
    batches: [hydrogenBatchesMock[0], hydrogenBatchesMock[1]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: HydrogenColor.GREEN,
    classificationType: BatchType.HYDROGEN,
    unit: MeasurementUnit.HYDROGEN,
  },
  {
    amount: 300,
    amountVerified: 0,
    batches: [hydrogenBatchesMock[2]],
    classifications: [],
    emissionOfProcessStep: 260,
    name: HydrogenColor.YELLOW,
    classificationType: BatchType.HYDROGEN,
    unit: MeasurementUnit.HYDROGEN,
  },
];
