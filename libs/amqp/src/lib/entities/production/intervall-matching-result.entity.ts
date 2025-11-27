/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionIntervallEntity } from './production-intervall.entity';

export class IntervallMatchingResultEntity {
  id: string;
  createdAt: Date;

  powerUsed: number;
  hydrogenProduced: number;
  numberOfBatches: number;

  constructor(id: string, createdAt: Date, batches: ProductionIntervallEntity[]) {
    const { powerAmount, hydrogenAmount } = batches.reduce(
      (acc, curr) => {
        acc.hydrogenAmount += curr.hydrogenAmount;
        acc.powerAmount += curr.powerAmount;
        return acc;
      },
      {
        powerAmount: 0,
        hydrogenAmount: 0,
      },
    );

    this.id = id;
    this.createdAt = createdAt;
    this.numberOfBatches = batches.length;
    this.powerUsed = powerAmount;
    this.hydrogenProduced = hydrogenAmount;
  }
}
