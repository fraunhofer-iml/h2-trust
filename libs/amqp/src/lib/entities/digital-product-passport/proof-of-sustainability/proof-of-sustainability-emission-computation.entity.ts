/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfSustainabilityEmissionCalculationEntity } from './proof-of-sustainability-emission-calculation.entity';
import { ProofOfSustainabilityProcessStepEmissionEntity } from './proof-of-sustainability-process-step-emission.entity';

export class ProofOfSustainabilityEmissionComputationEntity {
  calculations: ProofOfSustainabilityEmissionCalculationEntity[];
  processStepEmissions: ProofOfSustainabilityProcessStepEmissionEntity[];
  amountCO2PerMJH2: number;
  emissionReductionPercentage: number;

  constructor(
    calculations: ProofOfSustainabilityEmissionCalculationEntity[],
    processStepEmissions: ProofOfSustainabilityProcessStepEmissionEntity[],
    amountCO2PerMJH2: number,
    emissionReductionPercentage: number,
  ) {
    this.calculations = calculations;
    this.processStepEmissions = processStepEmissions;
    this.amountCO2PerMJH2 = amountCO2PerMJH2;
    this.emissionReductionPercentage = emissionReductionPercentage;
  }
}
