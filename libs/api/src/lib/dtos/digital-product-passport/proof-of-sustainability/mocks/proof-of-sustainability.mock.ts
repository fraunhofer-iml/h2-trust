/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfSustainabilityDto } from '../proof-of-sustainability.dto';
import { emissionCalculationMock } from './emission-calculation.mock';
import { processStepEmissionsMock } from './process-step-emission.mock';

export const proofOfSustainabilityMock: ProofOfSustainabilityDto = {
  amountCO2PerMJH2: 20.7,
  batchId: 'batch-456123',
  calculations: emissionCalculationMock,
  emissionReductionPercentage: 87.6,
  processStepEmissions: processStepEmissionsMock,
};
