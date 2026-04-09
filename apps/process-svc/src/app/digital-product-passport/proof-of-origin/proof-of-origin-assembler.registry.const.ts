/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { hydrogenBottlingProofOfOriginAssembler } from './hydrogen-bottling-proof-of-origin.assembler';
import { hydrogenProductionProofOfOriginAssembler } from './hydrogen-production-proof-of-origin.assembler';
import { hydrogenStorageProofOfOriginAssembler } from './hydrogen-storage-proof-of-origin.assembler';
import { hydrogenTransportationProofOfOriginAssembler } from './hydrogen-transportation-proof-of-origin.assembler';
import { ProofOfOriginAssembler } from './proof-of-origin-assembler.interface';

export const proofOfOriginAssemblers: ProofOfOriginAssembler[] = [
  hydrogenProductionProofOfOriginAssembler,
  hydrogenStorageProofOfOriginAssembler,
  hydrogenTransportationProofOfOriginAssembler,
  hydrogenBottlingProofOfOriginAssembler,
];
