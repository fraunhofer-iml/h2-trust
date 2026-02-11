/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColor } from '@h2-trust/domain';
import { HydrogenComponentDto } from '../hydrogen-component.dto';

export const HydrogenCompositionDtoMock: HydrogenComponentDto[] = [
  { processId: '', color: HydrogenColor.GREEN, amount: 1 },
  { processId: '', color: HydrogenColor.YELLOW, amount: 4 },
];
