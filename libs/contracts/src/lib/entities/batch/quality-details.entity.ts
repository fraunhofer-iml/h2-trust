/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDetailsDbType } from '@h2-trust/database';
import { PowerType, RfnboType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';

export class BatchDetailsEntity {
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

  static fromDatabase(batchDetails: BatchDetailsDbType): BatchDetailsEntity {
    assertValidEnum(batchDetails.rfnboType, RfnboType, 'RfnboType');
    assertValidEnum(batchDetails.productionPowerType, PowerType, 'PowerType');

    return new BatchDetailsEntity(
      batchDetails.id,
      batchDetails.rfnboType,
      batchDetails.productionPowerType,
      batchDetails.usedRenewablePower?.toNumber() ?? 0,
      batchDetails.usedGridPower?.toNumber() ?? 0,
      batchDetails.distance?.toNumber() ?? 0,
      batchDetails.wasteWater?.toNumber() ?? 0,
      batchDetails.resinConsumption?.toNumber() ?? 0,
      batchDetails.compressedAir?.toNumber() ?? 0,
      batchDetails.nitrogenConsumption?.toNumber() ?? 0,
    );
  }
}
