/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfSustainabilityEmissionCalculationEntity } from './proof-of-sustainability-emission-calculation.entity';
import { ProofOfSustainabilityProcessStepEmissionEntity } from './proof-of-sustainability-process-step-emission.entity';

export class ProofOfSustainabilityEntity {
  batchId: string;
  amountCO2PerMJH2: number;
  emissionReductionPercentage: number;
  calculations: ProofOfSustainabilityEmissionCalculationEntity[];
  processStepEmissions: ProofOfSustainabilityProcessStepEmissionEntity[];

  constructor(
    batchId: string,
    amountCO2PerMJH2: number,
    emissionReductionPercentage: number,
    calculations: ProofOfSustainabilityEmissionCalculationEntity[],
    processStepEmissions: ProofOfSustainabilityProcessStepEmissionEntity[],
  ) {
    this.batchId = batchId;
    this.amountCO2PerMJH2 = amountCO2PerMJH2;
    this.emissionReductionPercentage = emissionReductionPercentage;
    this.calculations = calculations;
    this.processStepEmissions = processStepEmissions;
  }
}
