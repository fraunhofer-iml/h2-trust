/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionDeepDbType } from '@h2-trust/database';
import { HydrogenColor } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';

export class StagedProductionEntity {
  startedAt: Date;
  hydrogenAmount: number;
  hydrogenProductionUnitId: string;
  hydrogenProductionUnitOwnerId: string;
  powerAmount: number;
  powerProductionUnitId: string;
  powerProductionUnitOwnerId: string;
  hydrogenColor: HydrogenColor;
  waterConsumptionLitersPerHour: number;

  constructor(
    startedAt: Date,
    hydrogenAmount: number,
    hydrogenProductionUnitId: string,
    hydrogenProductionUnitOwnerId: string,
    powerAmount: number,
    powerProductionUnitId: string,
    powerProductionUnitOwnerId: string,
    hydrogenColor: HydrogenColor,
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

  static fromDeepDatabase(stagedProduction: StagedProductionDeepDbType) {
    assertValidEnum(stagedProduction.powerProductionUnit.type.hydrogenColor, HydrogenColor);
    return new StagedProductionEntity(
      stagedProduction.startedAt,
      stagedProduction.hydrogenAmount.toNumber(),
      stagedProduction.hydrogenProductionUnitId,
      stagedProduction.hydrogenProductionUnit.generalInfo.ownerId,
      stagedProduction.powerAmount.toNumber(),
      stagedProduction.powerProductionUnitId,
      stagedProduction.powerProductionUnit.generalInfo.ownerId,
      stagedProduction.powerProductionUnit.type.hydrogenColor,
      stagedProduction.hydrogenProductionUnit.waterConsumptionLitersPerHour.toNumber(),
    );
  }
}
