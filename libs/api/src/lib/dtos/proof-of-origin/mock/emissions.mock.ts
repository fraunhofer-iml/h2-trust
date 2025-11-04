/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionDto } from '../emission.dto';

export const EmissionMock: EmissionDto = {
  amountCO2: 300,
  amountCO2PerKgH2: 5.7,
  basisOfCalculation: 'Emission (kg CO₂) = Fuel Amount (L or kg) × Emission Factor (kg CO₂ per L or kg)',
};
