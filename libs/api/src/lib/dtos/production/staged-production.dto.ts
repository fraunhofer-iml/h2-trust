/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvContentType } from '@h2-trust/domain';

export class StagedProductionDto {
  id: string;
  startedAt: Date;
  endedAt: Date;
  amountProduced: number;
  csvContentType: CsvContentType;
  uploadedBy: string; // company name
  productionUnitId: string;
  amountConsumed?: number; // amount of power consumed, only set if csv content type is hydrogen

  constructor(
    id: string,
    startedAt: Date,
    endedAt: Date,
    amountProduced: number,
    csvContentType: CsvContentType,
    uploadedBy: string,
    productionUnitId: string,
    amountConsumed?: number,
  ) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.amountProduced = amountProduced;
    this.csvContentType = csvContentType;
    this.uploadedBy = uploadedBy;
    this.productionUnitId = productionUnitId;
    this.amountConsumed = amountConsumed;
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
