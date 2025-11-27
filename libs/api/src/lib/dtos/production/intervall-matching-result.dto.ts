/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IntervallMatchingResultEntity } from '@h2-trust/amqp';

export class IntervallMatchingResultDto {
  id: string;
  createdAt: Date;

  powerUsed: number;
  hydrogenProduced: number;
  numberOfBatches: number;

  constructor(entity: IntervallMatchingResultEntity) {
    this.id = entity.id;
    this.createdAt = entity.createdAt;
    this.powerUsed = entity.powerUsed;
    this.hydrogenProduced = entity.hydrogenProduced;
    this.numberOfBatches = entity.numberOfBatches;
  }
}
