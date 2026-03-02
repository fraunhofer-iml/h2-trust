/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource } from '@h2-trust/domain';
import { EnumLabelMapper } from '../../../../labels';
import { CompanyDtoMock } from '../../../company';
import { PowerBatchDto } from '../power-batch.dto';
import { EmissionMock } from './emissions.mock';

export const PowerBatchesMock: PowerBatchDto[] = [
  {
    id: 'power-batch-1-wind',
    amount: 30,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.POWER),
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.WIND_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: 'power-production-unit-1',
    batchType: BatchType.POWER,
  },
  {
    id: 'power-batch-2-wind',
    amount: 30,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.POWER),
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.WIND_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: 'power-production-unit-1',
    batchType: BatchType.POWER,
  },
  {
    id: 'power-batch-3-solar',
    amount: 30,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.POWER),
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.SOLAR_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: 'power-production-unit-1',
    batchType: BatchType.POWER,
  },
  {
    id: 'power-batch-4-solar',
    amount: 30,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.POWER),
    accountingPeriodEnd: new Date(),
    createdAt: new Date(),
    emission: EmissionMock,
    energySource: EnergySource.SOLAR_ENERGY,
    producer: CompanyDtoMock[0].name,
    unitId: 'power-production-unit-1',
    batchType: BatchType.POWER,
  },
];
