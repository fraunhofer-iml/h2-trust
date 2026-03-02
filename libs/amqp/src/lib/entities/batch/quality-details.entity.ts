/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetailsDbType } from '@h2-trust/database';
import { RfnboType } from '@h2-trust/domain';

export class QualityDetailsEntity {
  id?: string;
  color: string;
  rfnbo: string;

  constructor(id: string | undefined, color: string, rfnbo?: string) {
    this.id = id;
    this.color = color;
    this.rfnbo = rfnbo ?? RfnboType.NOT_SPECIFIED;
  }

  static fromDatabase(qualityDetails: QualityDetailsDbType): QualityDetailsEntity {
    return new QualityDetailsEntity(
      qualityDetails.id,
      qualityDetails.color,
      qualityDetails.rfnbo ?? RfnboType.NOT_SPECIFIED,
    );
  }
}
