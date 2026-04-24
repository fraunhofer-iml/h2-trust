/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType, MeasurementUnit } from '@h2-trust/domain';
import { EmissionDto } from './emission.dto';

export abstract class BatchDto {
  id: string;
  emission: EmissionDto;
  createdAt: Date;
  amount: number;
  unit: MeasurementUnit;
  batchType: BatchType;

  protected constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: MeasurementUnit,
    batchType: BatchType,
  ) {
    this.id = id;
    this.emission = emission;
    this.createdAt = creationDate;
    this.amount = amount;
    this.unit = unit;
    this.batchType = batchType;
  }
}
