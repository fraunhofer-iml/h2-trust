/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor } from '@h2-trust/domain';
import { HydrogenComponentEntity } from '../hydrogen-component.entity';

export const HydrogenCompositionEntityMock: HydrogenComponentEntity[] = [
  new HydrogenComponentEntity(HydrogenColor.GREEN, 10),
  new HydrogenComponentEntity(HydrogenColor.ORANGE, 20),
  new HydrogenComponentEntity(HydrogenColor.PINK, 30),
  new HydrogenComponentEntity(HydrogenColor.YELLOW, 40),
  new HydrogenComponentEntity(HydrogenColor.MIX, 50),
];
