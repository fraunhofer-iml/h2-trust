/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfSustainabilityEmissionCalculationEntity } from './proof-of-sustainability-emission-calculation.entity';
import { ProofOfSustainabilityEmissionEntity } from './proof-of-sustainability-emission.entity';

export class ProofOfSustainabilityEntity {
  batchId: string;
  totalEmissions: number;
  amountCO2PerKgH2: number;
  amountCO2PerMJH2: number;
  emissionReductionPercentage: number;
  calculations: ProofOfSustainabilityEmissionCalculationEntity[];
  emissions: ProofOfSustainabilityEmissionEntity[];

  constructor(
    batchId: string,
    totalEmissions: number,
    amountCO2PerKgH2: number,
    amountCO2PerMJH2: number,
    emissionReductionPercentage: number,
    calculations: ProofOfSustainabilityEmissionCalculationEntity[],
    emissions: ProofOfSustainabilityEmissionEntity[],
  ) {
    this.batchId = batchId;
    this.totalEmissions = totalEmissions;
    this.amountCO2PerKgH2 = amountCO2PerKgH2;
    this.amountCO2PerMJH2 = amountCO2PerMJH2;
    this.emissionReductionPercentage = emissionReductionPercentage;
    this.calculations = calculations;
    this.emissions = emissions;
  }
}
