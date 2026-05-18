/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionDeepDbType } from '@h2-trust/database';
import { CsvContentType } from '@h2-trust/domain';
import { ValidationException } from '@h2-trust/exceptions';

export class StagedProductionEntity {
  id?: string;
  startedAt: Date;
  endedAt: Date;
  amountProduced: number;
  unitId: string;
  ownerId: string;
  powerConsumed: number;
  type: CsvContentType;
  csvImportId?: string;

  constructor(
    id: string | undefined,
    startedAt: Date,
    endedAt: Date,
    amountProduced: number,
    unitId: string,
    ownerId: string,
    powerConsumed: number,
    type: CsvContentType,
    csvImportId?: string,
  ) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.amountProduced = amountProduced;
    this.unitId = unitId;
    this.ownerId = ownerId;
    this.powerConsumed = powerConsumed;
    this.type = type;
    this.csvImportId = csvImportId;
  }

  static fromDeepDatabase(stagedProduction: StagedProductionDeepDbType) {
    if (stagedProduction.type != CsvContentType.HYDROGEN && stagedProduction.type != CsvContentType.POWER) {
      throw new ValidationException(
        `The staged production is not of type ${CsvContentType.HYDROGEN} or ${CsvContentType.POWER}`,
      );
    }

    return new StagedProductionEntity(
      stagedProduction.id,
      stagedProduction.startedAt,
      stagedProduction.endedAt,
      stagedProduction.amountProduced.toNumber(),
      stagedProduction.unitId,
      stagedProduction.ownerId,
      stagedProduction.powerConsumed.toNumber(),
      stagedProduction.type,
      stagedProduction.csvImportId,
    );
  }
}
