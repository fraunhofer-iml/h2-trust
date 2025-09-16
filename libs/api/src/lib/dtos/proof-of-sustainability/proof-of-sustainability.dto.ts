/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionCalculationDto } from './emission-calculation.dto';
import { EmissionForProcessStepDto } from './process-step-emission.dto';

export class ProofOfSustainabilityDto {
  batchId: string;
  amountCO2PerMJH2: number;
  emissionReductionPercentage: number;
  calculations: EmissionCalculationDto[];
  processStepEmissions: EmissionForProcessStepDto[];

  constructor(
    batchId: string,
    amountCO2PerMJH2: number,
    emissionReductionPercentage: number,
    calculations: EmissionCalculationDto[],
    processStepEmissions: EmissionForProcessStepDto[],
  ) {
    this.batchId = batchId;
    this.amountCO2PerMJH2 = amountCO2PerMJH2;
    this.emissionReductionPercentage = emissionReductionPercentage;
    this.calculations = calculations;
    this.processStepEmissions = processStepEmissions;
  }
}
