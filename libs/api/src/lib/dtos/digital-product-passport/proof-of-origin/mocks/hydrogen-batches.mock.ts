/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, HydrogenColor, HydrogenProductionMethod, ProcessType } from '@h2-trust/domain';
import { EnumLabelMapper } from '../../../../labels';
import { CompanyDtoMock } from '../../../company';
import { HydrogenBatchDto } from '../hydrogen-batch.dto';
import { EmissionMock } from './emissions.mock';

export const hydrogenBatchesMock: HydrogenBatchDto[] = [
  {
    id: 'hydrogen-batch-1',
    amount: 300,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.HYDROGEN),
    color: HydrogenColor.GREEN,
    createdAt: new Date(),
    accountingPeriodEnd: new Date(),
    emission: EmissionMock,
    hydrogenComposition: [{ processId: '', color: HydrogenColor.GREEN, amount: 300 }],
    processStep: ProcessType.HYDROGEN_PRODUCTION,
    producer: CompanyDtoMock[1].name,
    rfnboType: true,
    typeOfProduction: HydrogenProductionMethod.ELECTROLYSIS,
    unitId: 'hydrogen-production-unit-1',
    batchType: BatchType.HYDROGEN,
  },
  {
    id: 'hydrogen-batch-2',
    amount: 300,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.HYDROGEN),
    color: HydrogenColor.GREEN,
    createdAt: new Date(),
    accountingPeriodEnd: new Date(),
    emission: EmissionMock,
    hydrogenComposition: [{ processId: '', color: HydrogenColor.GREEN, amount: 300 }],
    processStep: ProcessType.HYDROGEN_PRODUCTION,
    producer: CompanyDtoMock[1].name,
    rfnboType: true,
    typeOfProduction: HydrogenProductionMethod.ELECTROLYSIS,
    unitId: 'hydrogen-production-unit-1',
    batchType: BatchType.HYDROGEN,
  },
  {
    id: 'hydrogen-batch-3',
    amount: 300,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.HYDROGEN),
    color: HydrogenColor.YELLOW,
    createdAt: new Date(),
    accountingPeriodEnd: new Date(),
    emission: EmissionMock,
    hydrogenComposition: [{ processId: '', color: HydrogenColor.YELLOW, amount: 300 }],
    processStep: ProcessType.HYDROGEN_PRODUCTION,
    producer: CompanyDtoMock[1].name,
    rfnboType: false,
    typeOfProduction: HydrogenProductionMethod.ELECTROLYSIS,
    unitId: 'hydrogen-production-unit-1',
    batchType: BatchType.HYDROGEN,
  },
  {
    id: 'hydrogen-batch-4',
    amount: 600,
    unit: EnumLabelMapper.getMeasurementUnit(BatchType.HYDROGEN),
    color: HydrogenColor.MIX,
    createdAt: new Date(),
    emission: EmissionMock,
    hydrogenComposition: [
      { processId: '', color: HydrogenColor.GREEN, amount: 300 },
      { processId: '', color: HydrogenColor.YELLOW, amount: 300 },
    ],
    processStep: ProcessType.HYDROGEN_BOTTLING,
    producer: CompanyDtoMock[1].name,
    rfnboType: false,
    typeOfProduction: HydrogenProductionMethod.ELECTROLYSIS,
    unitId: 'hydrogen-production-unit-1',
    batchType: BatchType.HYDROGEN,
  },
];
