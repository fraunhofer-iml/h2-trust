/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionDto } from './emission.dto';

export class WaterDetailsDto {
  amount: number;
  emission: EmissionDto;

  constructor(amount: number, emission: EmissionDto) {
    this.amount = amount;
    this.emission = emission;
  }
}
