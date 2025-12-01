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

  constructor(id: string, createdAt: Date, powerUsed: number, hydrogenProduced: number, numberOfBatches: number) {
    this.id = id;
    (this.createdAt = createdAt), (this.powerUsed = powerUsed);
    (this.hydrogenProduced = hydrogenProduced), (this.numberOfBatches = numberOfBatches);
  }

  static fromDatabase(entity: IntervallMatchingResultEntity) {
    return new IntervallMatchingResultDto(
      entity.id,
      entity.createdAt,
      entity.powerUsed,
      entity.hydrogenProduced,
      entity.numberOfBatches,
    );
  }
}
