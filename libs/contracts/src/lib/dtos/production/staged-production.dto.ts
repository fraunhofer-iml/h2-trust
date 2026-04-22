/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionEntity } from '@h2-trust/contracts/entities';
import { CsvContentType } from '@h2-trust/domain';
import { assertDefined } from '@h2-trust/utils';

export class StagedProductionDto {
  id: string;
  startedAt: Date;
  endedAt: Date;
  amountProduced: number;
  csvContentType: CsvContentType;
  uploadedBy: string; // company name
  productionUnitId: string;
  powerConsumed?: number; // amount of power consumed, only set if csv content type is hydrogen

  constructor(
    id: string,
    startedAt: Date,
    endedAt: Date,
    amountProduced: number,
    csvContentType: CsvContentType,
    uploadedBy: string,
    productionUnitId: string,
    powerConsumed?: number,
  ) {
    this.id = id;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.amountProduced = amountProduced;
    this.csvContentType = csvContentType;
    this.uploadedBy = uploadedBy;
    this.productionUnitId = productionUnitId;
    this.powerConsumed = powerConsumed;
  }

  static fromEntity(stagedProduction: StagedProductionEntity): StagedProductionDto {
    assertDefined(stagedProduction.id, `stage production id`);
    return new StagedProductionDto(
      stagedProduction.id,
      stagedProduction.startedAt,
      stagedProduction.endedAt,
      stagedProduction.amountProduced,
      stagedProduction.type,
      stagedProduction.ownerId,
      stagedProduction.unitId,
      stagedProduction.powerConsumed,
    );
  }
}
