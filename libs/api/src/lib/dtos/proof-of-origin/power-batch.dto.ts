/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, EnergySource } from '@h2-trust/domain';
import { EmissionDto } from './emission.dto';
import { BatchDto } from './batch.dto';

export class PowerBatchDto extends BatchDto {
  amountVerified: number;
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
    amountVerified: number,
    producer: string,
    unitId: string,
    energySource: EnergySource,
    accountingPeriodEnd: Date,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.POWER);
    this.producer = producer;
    this.unitId = unitId;
    this.amountVerified = amountVerified;
    this.energySource = energySource;
    this.accountingPeriodEnd = accountingPeriodEnd;
  }
}
