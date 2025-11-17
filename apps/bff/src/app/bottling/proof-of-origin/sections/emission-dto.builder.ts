/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionCalculationDto, EmissionDto } from '@h2-trust/api';

// TODO-MP: move to emission module
export function toEmissionDto(calc: EmissionCalculationDto, hydrogenMassKg: number): EmissionDto {
  const amountCO2PerKgH2 = calc?.result ?? 0;
  const amountCO2 = amountCO2PerKgH2 * hydrogenMassKg;
  return new EmissionDto(amountCO2, amountCO2PerKgH2, calc?.basisOfCalculation ?? '');
}
