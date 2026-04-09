/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenBottlingPosService } from './hydrogen-bottling-pos.service';
import { HydrogenProductionPosService } from './hydrogen-production-pos.service';
import { HydrogenTransportPosService } from './hydrogen-transport-pos.service';
import { PowerProductionPosService } from './power-production-pos.service';
import { ProofOfSustainabilityAssembler } from './proof-of-sustainability-assembler.interface';
import { WaterConsumptionPosService } from './water-consumption-pos.service';

export const proofOfSustainabilityAssemblers: ProofOfSustainabilityAssembler[] = [
  new PowerProductionPosService(),
  new WaterConsumptionPosService(),
  new HydrogenProductionPosService(),
  new HydrogenBottlingPosService(),
  new HydrogenTransportPosService(),
];
