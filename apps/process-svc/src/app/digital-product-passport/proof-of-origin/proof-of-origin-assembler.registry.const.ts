/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { hydrogenBottlingProofOfOriginAssembler } from './sections/hydrogen-bottling-section.assembler';
import { hydrogenProductionProofOfOriginAssembler } from './sections/hydrogen-production-section.assembler';
import { hydrogenStorageProofOfOriginAssembler } from './sections/hydrogen-storage-section.assembler';
import { hydrogenTransportationProofOfOriginAssembler } from './sections/hydrogen-transportation-transportation.assembler';
import { ProofOfOriginSectionAssembler } from './proof-of-origin-assembler.interface';

export const proofOfOriginSectionAssemblers: ProofOfOriginSectionAssembler[] = [
  hydrogenProductionProofOfOriginAssembler,
  hydrogenStorageProofOfOriginAssembler,
  hydrogenTransportationProofOfOriginAssembler,
  hydrogenBottlingProofOfOriginAssembler,
];
