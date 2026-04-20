/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvContentType } from '@h2-trust/api';
import { StagedProductionDeepDbType } from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';

export class StagedProductionEntity {
  startedAt: Date;
  amount: number;
  unitId: string;
  usedPower: number;
  type: CsvContentType;
  filename: string;

  constructor(
    startedAt: Date,
    amount: number,
    unitId: string,
    usedPower: number,
    type: CsvContentType,
    filename: string,
  ) {
    this.startedAt = startedAt;
    this.amount = amount;
    this.unitId = unitId;
    this.usedPower = usedPower;
    this.type = type;
    this.filename = filename;
  }

  static fromDeepDatabase(stagedProduction: StagedProductionDeepDbType) {
    if (stagedProduction.type != BatchType.HYDROGEN && stagedProduction.type != BatchType.POWER) {
      const message = `The staged production is not of type ${BatchType.HYDROGEN} or ${BatchType.POWER}`;
      throw new Error(message);
    }

    return new StagedProductionEntity(
      stagedProduction.startedAt,
      stagedProduction.amount.toNumber(),
      stagedProduction.unitId,
      stagedProduction.usedPower.toNumber(),
      stagedProduction.type,
      '',
    );
  }
}
