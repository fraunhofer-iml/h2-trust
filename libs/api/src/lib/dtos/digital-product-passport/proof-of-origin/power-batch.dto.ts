/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource } from '@h2-trust/domain';
import { BatchDto } from './batch.dto';
import { EmissionDto } from './emission.dto';

export class PowerBatchDto extends BatchDto {
  producer: string;
  unitId: string;
  energySource: EnergySource;
  accountingPeriodEnd: Date;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: string,
    producer: string,
    unitId: string,
    energySource: EnergySource,
    accountingPeriodEnd: Date,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.POWER);
    this.producer = producer;
    this.unitId = unitId;
    this.energySource = energySource;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
