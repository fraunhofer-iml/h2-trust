/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProofOfSustainabilityEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { EmissionService } from '../proof-of-origin/emission.service';
import { ProvenanceService } from '../provenance/provenance.service';

@Injectable()
export class ProofOfSustainabilityService {
  constructor(
    private readonly provenanceService: ProvenanceService,
    private readonly emissionService: EmissionService,
  ) {}

  async buildProofOfSustainability(processStepId: string): Promise<ProofOfSustainabilityEntity> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStepId);
    return this.emissionService.computeProvenanceEmissions(provenance);
  }
}
