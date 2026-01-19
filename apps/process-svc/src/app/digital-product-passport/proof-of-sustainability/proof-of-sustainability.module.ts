/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ProofOfOriginModule } from '../proof-of-origin/proof-of-origin.module';
import { ProvenanceModule } from '../provenance/provenance.module';
import { ProofOfSustainabilityService } from './proof-of-sustainability.service';

@Module({
  imports: [ProvenanceModule, ProofOfOriginModule],
  providers: [ProofOfSustainabilityService],
  exports: [ProofOfSustainabilityService],
})
export class ProofOfSustainabilityModule {}
