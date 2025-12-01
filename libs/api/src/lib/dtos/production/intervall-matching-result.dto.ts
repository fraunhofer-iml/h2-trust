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

  powerUsed: number;
  hydrogenProduced: number;
  numberOfBatches: number;

  constructor(id: string, powerUsed: number, hydrogenProduced: number, numberOfBatches: number) {
    this.id = id;
    this.powerUsed = powerUsed;
    this.hydrogenProduced = hydrogenProduced;
    this.numberOfBatches = numberOfBatches;
  }

  static fromEntity(entity: IntervallMatchingResultEntity) {
    return new IntervallMatchingResultDto(entity.id, entity.powerUsed, entity.hydrogenProduced, entity.numberOfBatches);
  }
}
