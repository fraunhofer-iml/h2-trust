/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QualityDetails } from '@prisma/client';
import { HydrogenColor } from '@h2-trust/domain';

export const QualityDetailsSeed: readonly QualityDetails[] = Object.freeze([
  {
    id: 'quality-details-0',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-1',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-2',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-3',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-4',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-5',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-6',
    color: HydrogenColor.YELLOW,
  },
  {
    id: 'quality-details-7',
    color: HydrogenColor.YELLOW,
  },
  {
    id: 'quality-details-8',
    color: HydrogenColor.YELLOW,
  },
  {
    id: 'quality-details-9',
    color: HydrogenColor.YELLOW,
  },
  {
    id: 'quality-details-10',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-11',
    color: HydrogenColor.MIX,
  },
  {
    id: 'quality-details-12',
    color: HydrogenColor.MIX,
  },
  {
    id: 'quality-details-13',
    color: HydrogenColor.GREEN,
  },
  {
    id: 'quality-details-14',
    color: HydrogenColor.MIX,
  },
  {
    id: 'quality-details-15',
    color: HydrogenColor.MIX,
  },
]);
