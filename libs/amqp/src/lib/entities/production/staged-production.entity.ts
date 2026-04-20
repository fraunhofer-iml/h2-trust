/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionDeepDbType } from '@h2-trust/database';
import { BatchType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';

export class StagedProductionEntity {
  startedAt: Date;
  amount: number;
  unitId: string;
  usedPower: number;
  type: BatchType;
  filename: string;

  constructor(startedAt: Date, amount: number, unitId: string, usedPower: number, type: BatchType, filename: string) {
    this.startedAt = startedAt;
    this.amount = amount;
    this.unitId = unitId;
    this.usedPower = usedPower;
    this.type = type;
    this.filename = filename;
  }

  static fromDeepDatabase(stagedProduction: StagedProductionDeepDbType) {
    assertValidEnum(stagedProduction.type, BatchType, 'BatchType');

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
