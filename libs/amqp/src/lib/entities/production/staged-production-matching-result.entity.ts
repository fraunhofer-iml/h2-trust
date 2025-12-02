/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionEntity } from './staged-production.entity';

export class StagedProductionMatchingResultEntity {
  id: string;
  createdAt: Date;

  powerUsed: number;
  hydrogenProduced: number;
  numberOfBatches: number;

  constructor(id: string, stagedProductions: StagedProductionEntity[]) {
    const { powerAmount, hydrogenAmount } = (stagedProductions ?? []).reduce(
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
    this.createdAt = stagedProductions[0].startedAt;
    this.numberOfBatches = stagedProductions.length;
    this.powerUsed = powerAmount;
    this.hydrogenProduced = hydrogenAmount;
  }
}
