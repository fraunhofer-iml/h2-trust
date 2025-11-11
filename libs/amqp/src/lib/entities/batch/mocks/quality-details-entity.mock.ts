/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor } from '@h2-trust/domain';
import { QualityDetailsEntity } from '../quality-details.entity';

export const QualityDetailsEntityMock: QualityDetailsEntity[] = [
  new QualityDetailsEntity('quality-details-0', HydrogenColor.GREEN),
  new QualityDetailsEntity('quality-details-1', HydrogenColor.YELLOW),
  new QualityDetailsEntity('quality-details-2', HydrogenColor.MIX),
];
