/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { hydrogenBottlingEmissionAssembler } from './emissions/hydrogen-bottling-emission-calculation.assembler';
import { hydrogenProductionEmissionAssembler } from './emissions/hydrogen-production-emission-calculation.assembler';
import { hydrogenTransportationEmissionAssembler } from './emissions/hydrogen-transportation-emission-calculation.assembler';
import { powerProductionEmissionAssembler } from './emissions/power-production-emission-calculation.assembler';
import { waterConsumptionEmissionAssembler } from './emissions/water-consumption-emission-calculation.assembler';
import { ProofOfSustainabilityEmissionAssembler } from './proof-of-sustainability-assembler.interface';

export const proofOfSustainabilityEmissionAssemblers: ProofOfSustainabilityEmissionAssembler[] = [
  powerProductionEmissionAssembler,
  waterConsumptionEmissionAssembler,
  hydrogenProductionEmissionAssembler,
  hydrogenBottlingEmissionAssembler,
  hydrogenTransportationEmissionAssembler,
];
