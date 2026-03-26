/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeasurementUnit } from '@h2-trust/domain';

export interface StatCardConfig {
  icon: string;
  value: number | undefined;
  percentage: number | null;
  unit: MeasurementUnit;
  label: string;
  theme: 'power-total' | 'power-fraction' | 'hydrogen-total' | 'hydrogen-fraction';
}
