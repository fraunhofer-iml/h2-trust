/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchType } from '@h2-trust/domain';
import { BatchDto } from './batch.dto';
import { EmissionDto } from './emission.dto';
import { WaterDetailsDto } from './water-details.dto';

export class WaterBatchDto extends BatchDto {
  deionizedWater: WaterDetailsDto;
  tapWater: WaterDetailsDto;
  wasteWater: WaterDetailsDto;

  constructor(
    id: string,
    emission: EmissionDto,
    creationDate: Date,
    amount: number,
    unit: string,
    deionizedWater: WaterDetailsDto,
    tapWater: WaterDetailsDto,
    wasteWater: WaterDetailsDto,
  ) {
    super(id, emission, creationDate, amount, unit, BatchType.WATER);
    this.deionizedWater = deionizedWater;
    this.tapWater = tapWater;
    this.wasteWater = wasteWater;
  }
}
