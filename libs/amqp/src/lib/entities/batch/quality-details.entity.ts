/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetailsDbType } from '@h2-trust/database';
import { HydrogenColor, PowerType, RfnboType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';

export class QualityDetailsEntity {
  id?: string;
  color: HydrogenColor;
  rfnboType: RfnboType;
  powerType: PowerType;

  constructor(id: string | undefined, color: HydrogenColor, rfnboType: RfnboType, powerType: PowerType) {
    this.id = id;
    this.color = color;
    this.rfnboType = rfnboType;
    this.powerType = powerType;
  }

  static fromDatabase(qualityDetails: QualityDetailsDbType): QualityDetailsEntity {
    assertValidEnum(qualityDetails.color, HydrogenColor);
    assertValidEnum(qualityDetails.rfnboType, RfnboType);
    assertValidEnum(qualityDetails.powerType, PowerType);

    return new QualityDetailsEntity(
      qualityDetails.id,
      qualityDetails.color,
      qualityDetails.rfnboType,
      qualityDetails.powerType,
    );
  }
}
