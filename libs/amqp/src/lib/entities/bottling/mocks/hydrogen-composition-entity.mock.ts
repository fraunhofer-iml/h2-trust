/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor, RFNBOType } from '@h2-trust/domain';
import { HydrogenComponentEntity } from '../hydrogen-component.entity';

export const HydrogenCompositionEntityMock: HydrogenComponentEntity[] = [
  new HydrogenComponentEntity('', HydrogenColor.GREEN, 10, RFNBOType.RFNBO_READY),
  new HydrogenComponentEntity('', HydrogenColor.YELLOW, 40, RFNBOType.NOT_SPECIFIED),
  new HydrogenComponentEntity('', HydrogenColor.MIX, 50, RFNBOType.NOT_SPECIFIED),
];
