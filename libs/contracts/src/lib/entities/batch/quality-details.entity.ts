/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetailsDbType } from '@h2-trust/database';
import { PowerType, RfnboType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';

export class QualityDetailsEntity {
  id?: string;
  rfnboType: RfnboType;
  productionPowerType: PowerType;
  usedRenewablePower?: number;
  usedGridPower?: number;
  distance?: number;
  wasteWater?: number;
  resinConsumption?: number;
  compressedAir?: number;
  nitrogenConsumption?: number;

  constructor(
    id: string | undefined,
    rfnboType: RfnboType,
    productionPowerType: PowerType,
    usedRenewablePower?: number,
    usedGridPower?: number,
    distance?: number,
    wasteWater?: number,
    resinConsumption?: number,
    compressedAir?: number,
    nitrogenConsumption?: number,
  ) {
    this.id = id;
    this.rfnboType = rfnboType;
    this.productionPowerType = productionPowerType;
    this.usedRenewablePower = usedRenewablePower;
    this.usedGridPower = usedGridPower;
    this.distance = distance;
    this.wasteWater = wasteWater;
    this.resinConsumption = resinConsumption;
    this.compressedAir = compressedAir;
    this.nitrogenConsumption = nitrogenConsumption;
  }

  static fromDatabase(qualityDetails: QualityDetailsDbType): QualityDetailsEntity {
    assertValidEnum(qualityDetails.rfnboType, RfnboType, 'RfnboType');
    assertValidEnum(qualityDetails.productionPowerType, PowerType, 'PowerType');

    return new QualityDetailsEntity(
      qualityDetails.id,
      qualityDetails.rfnboType,
      qualityDetails.productionPowerType,
      qualityDetails.usedRenewablePower?.toNumber() ?? 0,
      qualityDetails.usedGridPower?.toNumber() ?? 0,
      qualityDetails.distance?.toNumber() ?? 0,
      qualityDetails.wasteWater?.toNumber() ?? 0,
      qualityDetails.resinConsumption?.toNumber() ?? 0,
      qualityDetails.compressedAir?.toNumber() ?? 0,
      qualityDetails.nitrogenConsumption?.toNumber() ?? 0,
    );
  }
}
