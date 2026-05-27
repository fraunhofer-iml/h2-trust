/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, HydrogenProductionMethod, MeasurementUnit, ProcessType, RfnboType } from '@h2-trust/domain';
import { HydrogenComponentDto } from '../general-information';
import { DppBatchDto } from './dpp-batch.dto';
import { EmissionDto } from './emission.dto';

export class HydrogenBatchDto extends DppBatchDto {
  producer: string;
  unitId: string;
  typeOfProduction: HydrogenProductionMethod;
  hydrogenComposition: HydrogenComponentDto[];
  rfnboType: RfnboType;
  processStep: ProcessType;

  // optional for all bottled batches, since bottled batches only have a creation/bottling time and no accounting period
  accountingPeriodEnd?: Date;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: MeasurementUnit,
    producer: string,
    unitId: string,
    typeOfProduction: HydrogenProductionMethod,
    hydrogenComposition: HydrogenComponentDto[],
    rfnboType: RfnboType,
    processStep: ProcessType,
    accountingPeriodEnd?: Date,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.HYDROGEN);
    this.producer = producer;
    this.unitId = unitId;
    this.typeOfProduction = typeOfProduction;
    this.hydrogenComposition = hydrogenComposition;
    this.rfnboType = rfnboType;
    this.processStep = processStep;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
