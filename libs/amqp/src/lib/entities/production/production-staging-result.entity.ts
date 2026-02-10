/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DistributedProductionEntity } from './distributed-production.entity';

export class ProductionStagingResultEntity {
  id: string;
  createdAt: Date;
  powerUsed: number;
  hydrogenProduced: number;
  numberOfBatches: number;

  constructor(id: string, distributedProductions: DistributedProductionEntity[]) {
    const { powerAmount, hydrogenAmount } = (distributedProductions ?? []).reduce(
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
    this.createdAt = distributedProductions[0].startedAt;
    this.numberOfBatches = distributedProductions.length;
    this.powerUsed = powerAmount;
    this.hydrogenProduced = hydrogenAmount;
  }
}
