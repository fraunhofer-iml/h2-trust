/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  GeneralInformationEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
} from '@h2-trust/amqp';
import { GeneralInformationService } from './general-information/general-information.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from './proof-of-sustainability/proof-of-sustainability.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    private readonly generalInformationService: GeneralInformationService,
    private readonly proofOfOriginService: ProofOfOriginService,
    private readonly proofOfSustainabilityService: ProofOfSustainabilityService,
  ) {}

  async readGeneralInformation(processStepId: string): Promise<GeneralInformationEntity> {
    return this.generalInformationService.buildGeneralInformation(processStepId);
  }

  async readProofOfOrigin(processStepId: string): Promise<ProofOfOriginSectionEntity[]> {
    return this.proofOfOriginService.readProofOfOrigin(processStepId);
  }

  async readProofOfSustainability(processStepId: string): Promise<ProofOfSustainabilityEntity> {
    return this.proofOfSustainabilityService.buildProofOfSustainability(processStepId);
  }
}
