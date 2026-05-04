/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginSectionAssembler } from './proof-of-origin-assembler.interface';
import { hydrogenBottlingSectionAssembler } from './sections/hydrogen-bottling-section.assembler';
import { hydrogenProductionSectionAssembler } from './sections/hydrogen-production-section.assembler';
import { hydrogenStorageSectionAssembler } from './sections/hydrogen-storage-section.assembler';
import { hydrogenTransportationSectionAssembler } from './sections/hydrogen-transportation-transportation.assembler';

export const proofOfOriginSectionAssemblers: ProofOfOriginSectionAssembler[] = [
  hydrogenBottlingSectionAssembler,
  hydrogenProductionSectionAssembler,
  hydrogenStorageSectionAssembler,
  hydrogenTransportationSectionAssembler,
];
