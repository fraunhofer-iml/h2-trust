/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionEntity } from './staged-production.entity';

export class ProductionStagingResultEntity {
  id: string;
  createdAt: Date;
  powerUsed: number;
  amount: number;
  numberOfBatches: number;

  constructor(id: string, stagedProductions: StagedProductionEntity[]) {
    const { amount, usedPower } = (stagedProductions ?? []).reduce(
      (acc, curr) => {
        acc.amount += curr.amount;
        acc.usedPower += curr.usedPower;
        return acc;
      },
      {
        amount: 0,
        usedPower: 0,
      },
    );

    this.id = id;
    this.createdAt = stagedProductions[0].startedAt;
    this.numberOfBatches = stagedProductions.length;
    this.powerUsed = usedPower;
    this.amount = amount;
  }
}
