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
  powerType: PowerType;
  distance: number;

  constructor(id: string | undefined, rfnboType: RfnboType, powerType: PowerType, distance: number) {
    this.id = id;
    this.rfnboType = rfnboType;
    this.powerType = powerType;
    this.distance = distance;
  }

  static fromDatabase(qualityDetails: QualityDetailsDbType): QualityDetailsEntity {
    assertValidEnum(qualityDetails.rfnboType, RfnboType, 'RfnboType');
    assertValidEnum(qualityDetails.powerType, PowerType, 'PowerType');

    return new QualityDetailsEntity(
      qualityDetails.id,
      qualityDetails.rfnboType,
      qualityDetails.powerType,
      qualityDetails.distance?.toNumber() ?? 0,
    );
  }
}
