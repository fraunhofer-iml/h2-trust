/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionDbType } from '@h2-trust/database';

export class StagedProductionEntity {
  startedAt: Date;
  hydrogenAmount: number;
  hydrogenProductionUnitId: string;
  hydrogenProductionUnitOwnerId: string;
  powerAmount: number;
  powerProductionUnitId: string;
  powerProductionUnitOwnerId: string;
  hydrogenColor: string;
  waterConsumptionLitersPerHour: number;

  constructor(
    startedAt: Date,
    hydrogenAmount: number,
    hydrogenProductionUnitId: string,
    hydrogenProductionUnitOwnerId: string,
    powerAmount: number,
    powerProductionUnitId: string,
    powerProductionUnitOwnerId: string,
    hydrogenColor: string,
    waterConsumptionLitersPerHour: number,
  ) {
    this.startedAt = startedAt;
    this.hydrogenAmount = hydrogenAmount;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.hydrogenProductionUnitOwnerId = hydrogenProductionUnitOwnerId;
    this.powerAmount = powerAmount;
    this.powerProductionUnitId = powerProductionUnitId;
    this.powerProductionUnitOwnerId = powerProductionUnitOwnerId;
    this.hydrogenColor = hydrogenColor;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static fromDatabase(stagedProduction: StagedProductionDbType) {
    return new StagedProductionEntity(
      stagedProduction.startedAt,
      stagedProduction.hydrogenAmount.toNumber(),
      stagedProduction.hydrogenProductionUnitId,
      stagedProduction.hydrogenProductionUnit.generalInfo.owner.id,
      stagedProduction.powerAmount.toNumber(),
      stagedProduction.powerProductionUnitId,
      stagedProduction.powerProductionUnit.generalInfo.owner.id,
      stagedProduction.powerProductionUnit.type.hydrogenColor,
      stagedProduction.hydrogenProductionUnit.waterConsumptionLitersPerHour.toNumber(),
    );
  }
}
