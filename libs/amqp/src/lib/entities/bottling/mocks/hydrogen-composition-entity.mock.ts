/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor, RfnboType } from '@h2-trust/domain';
import { HydrogenComponentEntity } from '../hydrogen-component.entity';

export const HydrogenCompositionEntityMock: HydrogenComponentEntity[] = [
  new HydrogenComponentEntity(null, HydrogenColor.GREEN, 10, RfnboType.RFNBO_READY),
  new HydrogenComponentEntity(null, HydrogenColor.YELLOW, 40, RfnboType.NOT_SPECIFIED),
  new HydrogenComponentEntity(null, HydrogenColor.MIX, 50, RfnboType.NOT_SPECIFIED),
];
