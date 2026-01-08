/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedProductionEntity } from './parsed-production.entity';

export class ParsedProductionMatchingResultEntity {
  id: string;
  createdAt: Date;
  powerUsed: number;
  hydrogenProduced: number;
  numberOfBatches: number;

  constructor(id: string, parsedProductions: ParsedProductionEntity[]) {
    const { powerAmount, hydrogenAmount } = (parsedProductions ?? []).reduce(
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
    this.createdAt = parsedProductions[0].startedAt;
    this.numberOfBatches = parsedProductions.length;
    this.powerUsed = powerAmount;
    this.hydrogenProduced = hydrogenAmount;
  }
}
