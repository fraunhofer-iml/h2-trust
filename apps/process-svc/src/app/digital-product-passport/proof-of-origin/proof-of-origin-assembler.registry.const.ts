/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenBottlingProofOfOriginService } from './hydrogen-bottling-proof-of-origin.service';
import { HydrogenProductionProofOfOriginService } from './hydrogen-production-proof-of-origin.service';
import { HydrogenStorageProofOfOriginService } from './hydrogen-storage-proof-of-origin.service';
import { HydrogenTransportationProofOfOriginService } from './hydrogen-transportation-proof-of-origin.service';
import { ProofOfOriginAssembler } from './proof-of-origin-assembler.interface';

export const PROOF_OF_ORIGIN_ASSEMBLERS: ProofOfOriginAssembler[] = [
  new HydrogenProductionProofOfOriginService(),
  new HydrogenStorageProofOfOriginService(),
  new HydrogenTransportationProofOfOriginService(),
  new HydrogenBottlingProofOfOriginService(),
];
