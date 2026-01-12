/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DigitalProductPassportPatterns, ReadByIdPayload } from '@h2-trust/amqp';
import { GeneralInformationDto, ProofOfSustainabilityDto, SectionDto } from '@h2-trust/api';
import { DigitalProductPassportService } from './digital-product-passport.service';

@Controller()
export class DigitalProductPassportController {
  constructor(private readonly digitalProductPassportService: DigitalProductPassportService) { }

  @MessagePattern(DigitalProductPassportPatterns.READ_GENERAL_INFORMATION)
  async readGeneralInformation(payload: ReadByIdPayload): Promise<GeneralInformationDto> {
    return this.digitalProductPassportService.readGeneralInformation(payload.id);
  }

  @MessagePattern(DigitalProductPassportPatterns.READ_PROOF_OF_ORIGIN)
  async readProofOfOrigin(payload: ReadByIdPayload): Promise<SectionDto[]> {
    return this.digitalProductPassportService.readProofOfOrigin(payload.id);
  }

  @MessagePattern(DigitalProductPassportPatterns.READ_PROOF_OF_SUSTAINABILITY)
  async readProofOfSustainability(payload: ReadByIdPayload): Promise<ProofOfSustainabilityDto> {
    return this.digitalProductPassportService.readProofOfSustainability(payload.id);
  }
}
