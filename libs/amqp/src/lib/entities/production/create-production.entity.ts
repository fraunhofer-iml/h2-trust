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
  }

  static of(
    dto: CreateProductionDto,
    recordedBy: string,
    hydrogenColor: string,
    hydrogenStorageUnitId: string,
    companyIdOfPowerProductionUnit: string,
    companyIdOfHydrogenProductionUnit: string,
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
      hydrogenStorageUnitId,
      companyIdOfPowerProductionUnit,
      companyIdOfHydrogenProductionUnit,
    );
  }
}
