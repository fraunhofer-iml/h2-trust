/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { hydrogenBottlingProofOfSustainabilityAssembler } from './hydrogen-bottling-proof-of-sustainability.assembler';
import { hydrogenProductionProofOfSustainabilityAssembler } from './hydrogen-production-proof-of-sustainability.assembler';
import { hydrogenTransportationProofOfSustainabilityAssembler } from './hydrogen-transportation-proof-of-sustainability.assembler';
import { powerProductionProofOfSustainabilityAssembler } from './power-production-proof-of-sustainability.assembler';
import { ProofOfSustainabilityAssembler } from './proof-of-sustainability-assembler.interface';
import { waterConsumptionProofOfSustainabilityAssembler } from './water-consumption-proof-of-sustainability.assembler';

export const proofOfSustainabilityAssemblers: ProofOfSustainabilityAssembler[] = [
  powerProductionProofOfSustainabilityAssembler,
  waterConsumptionProofOfSustainabilityAssembler,
  hydrogenProductionProofOfSustainabilityAssembler,
  hydrogenBottlingProofOfSustainabilityAssembler,
  hydrogenTransportationProofOfSustainabilityAssembler,
];
