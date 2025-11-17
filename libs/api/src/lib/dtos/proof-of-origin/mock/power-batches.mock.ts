/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource, MeasurementUnit } from '@h2-trust/domain';
import { CompanyDtoMock } from '../../company';
import { PowerProductionUnitOverviewDtoMock } from '../../unit/mocks';
import { EmissionMock } from './emissions.mock';
import { PowerBatchDto } from '../power-batch.dto';

export const PowerBatchesMock: PowerBatchDto[] = [
  {
    id: 'power-batch-1-wind',
    amount: 30,
    unit: MeasurementUnit.POWER,
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.WIND_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
    batchType: BatchType.POWER,
  },
  {
    id: 'power-batch-2-wind',
    amount: 30,
    unit: MeasurementUnit.POWER,
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.WIND_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
    batchType: BatchType.POWER,
  },
  {
    id: 'power-batch-3-solar',
    amount: 30,
    unit: MeasurementUnit.POWER,
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.SOLAR_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
    batchType: BatchType.POWER,
  },
  {
    id: 'power-batch-4-solar',
    amount: 30,
    unit: MeasurementUnit.POWER,
    amountVerified: 20,
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.SOLAR_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: PowerProductionUnitOverviewDtoMock[0].id,
    batchType: BatchType.POWER,
  },
];
