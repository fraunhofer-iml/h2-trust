/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionEntity } from '@h2-trust/amqp';
import { CsvContentType } from '@h2-trust/api';

export class StagedProductionDto {
  startedAt: Date;
  endedAt: Date;
  amount: number;
  unitId: string;
  ownerId: string;
  usedPower: number;
  type: CsvContentType;
  csvImportId?: string;

  constructor(
    startedAt: Date,
    endedAt: Date,
    amount: number,
    unitId: string,
    ownerId: string,
    usedPower: number,
    type: CsvContentType,
    csvImportId?: string,
  ) {
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.amount = amount;
    this.unitId = unitId;
    this.ownerId = ownerId;
    this.usedPower = usedPower;
    this.type = type;
    this.csvImportId = csvImportId;
  }

  static fromEntity(stagedProduction: StagedProductionEntity) {
    return new StagedProductionEntity(
      stagedProduction.startedAt,
      stagedProduction.endedAt,
      stagedProduction.amount,
      stagedProduction.unitId,
      stagedProduction.ownerId,
      stagedProduction.usedPower,
      stagedProduction.type,
      stagedProduction.csvImportId,
    );
  }
}
