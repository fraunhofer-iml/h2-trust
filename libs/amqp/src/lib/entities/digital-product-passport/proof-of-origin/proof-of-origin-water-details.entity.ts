/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginEmissionEntity } from './proof-of-origin-emission.entity';

export class ProofOfOriginWaterDetailsEntity {
  amount: number;
  emission: ProofOfOriginEmissionEntity;

  constructor(amount: number, emission: ProofOfOriginEmissionEntity) {
    this.amount = amount;
    this.emission = emission;
  }
}
