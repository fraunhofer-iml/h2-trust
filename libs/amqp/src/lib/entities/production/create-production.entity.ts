/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProductionDto } from '@h2-trust/api';

export class CreateProductionEntity {
  productionStartedAt: string;
  productionEndedAt: string;
  powerProductionUnitId: string;
  powerAmountKwh: number;
  hydrogenProductionUnitId: string;
  hydrogenAmountKg: number;
  recordedBy: string;
  hydrogenColor: string;
  hydrogenStorageUnitId: string;
  companyIdOfPowerProductionUnit: string;
  companyIdOfHydrogenProductionUnit: string;
  waterConsumptionLitersPerHour: number;

  constructor(
    productionStartedAt: string,
    productionEndedAt: string,
    powerProductionUnitId: string,
    powerAmountKwh: number,
    hydrogenProductionUnitId: string,
    hydrogenAmountKg: number,
    recordedBy: string,
    hydrogenColor: string,
    hydrogenStorageUnitId: string,
    companyOfPowerProductionUnitId: string,
    companyOfHydrogenProductionUnitId: string,
    waterConsumptionLitersPerHour: number,
  ) {
    this.productionStartedAt = productionStartedAt;
    this.productionEndedAt = productionEndedAt;
    this.powerProductionUnitId = powerProductionUnitId;
    this.powerAmountKwh = powerAmountKwh;
    this.hydrogenProductionUnitId = hydrogenProductionUnitId;
    this.hydrogenAmountKg = hydrogenAmountKg;
    this.recordedBy = recordedBy;
    this.hydrogenColor = hydrogenColor;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
    this.companyIdOfPowerProductionUnit = companyOfPowerProductionUnitId;
    this.companyIdOfHydrogenProductionUnit = companyOfHydrogenProductionUnitId;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static of(
    dto: CreateProductionDto,
    recordedBy: string,
    hydrogenColor: string,
    companyIdOfPowerProductionUnit: string,
    companyIdOfHydrogenProductionUnit: string,
    waterConsumptionLitersPerHour: number,
  ): CreateProductionEntity {
    return new CreateProductionEntity(
      dto.productionStartedAt,
      dto.productionEndedAt,
      dto.powerProductionUnitId,
      dto.powerAmountKwh,
      dto.hydrogenProductionUnitId,
      dto.hydrogenAmountKg,
      recordedBy,
      hydrogenColor,
      dto.hydrogenStorageUnitId,
      companyIdOfPowerProductionUnit,
      companyIdOfHydrogenProductionUnit,
      waterConsumptionLitersPerHour,
    );
  }
}
