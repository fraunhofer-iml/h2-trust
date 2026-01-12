/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  DigitalProductPassportGeneralInformationEntity,
  DigitalProductPassportPatterns,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ReadByIdPayload,
} from '@h2-trust/amqp';
import { DigitalProductPassportService } from './digital-product-passport.service';

@Controller()
export class DigitalProductPassportController {
  constructor(private readonly digitalProductPassportService: DigitalProductPassportService) {}

  @MessagePattern(DigitalProductPassportPatterns.READ_GENERAL_INFORMATION)
  async readGeneralInformation(payload: ReadByIdPayload): Promise<DigitalProductPassportGeneralInformationEntity> {
    return this.digitalProductPassportService.readGeneralInformation(payload.id);
  }

  @MessagePattern(DigitalProductPassportPatterns.READ_PROOF_OF_ORIGIN)
  async readProofOfOrigin(payload: ReadByIdPayload): Promise<ProofOfOriginSectionEntity[]> {
    return this.digitalProductPassportService.readProofOfOrigin(payload.id);
  }

  @MessagePattern(DigitalProductPassportPatterns.READ_PROOF_OF_SUSTAINABILITY)
  async readProofOfSustainability(payload: ReadByIdPayload): Promise<ProofOfSustainabilityEntity> {
    return this.digitalProductPassportService.readProofOfSustainability(payload.id);
  }
}
