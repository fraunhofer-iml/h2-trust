/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, MeasurementUnit, PowerProductionType, PowerType } from '@h2-trust/domain';
import { DppBatchDto } from './dpp-batch.dto';
import { EmissionDto } from './emission.dto';

export class PowerBatchDto extends DppBatchDto {
  producer: string;
  unitId: string;
  powerProductionType: PowerProductionType;
  accountingPeriodEnd: Date;
  powerType: PowerType;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: MeasurementUnit,
    producer: string,
    unitId: string,
    powerProductionType: PowerProductionType,
    accountingPeriodEnd: Date,
    powerType: PowerType,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.POWER);
    this.producer = producer;
    this.unitId = unitId;
    this.powerProductionType = powerProductionType;
    this.accountingPeriodEnd = accountingPeriodEnd;
    this.powerType = powerType;
  }
}
