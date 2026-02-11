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
  DigitalProductPassportPatterns,
  GeneralInformationEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ReadByIdPayload,
  ReadByIdsPayload,
} from '@h2-trust/amqp';
import { DigitalProductPassportDto, HydrogenComponentDto } from '@h2-trust/api';
import { DigitalProductPassportCalculationService } from './digital-product-passport.calculation.service';
import { DigitalProductPassportService } from './digital-product-passport.service';

@Controller()
export class DigitalProductPassportController {
  constructor(
    private readonly digitalProductPassportService: DigitalProductPassportService,
    private readonly digitalProductPassportCalculationService: DigitalProductPassportCalculationService,
  ) {}

  @MessagePattern(DigitalProductPassportPatterns.READ_DPPS_OF_FILLINGS)
  async getDPPForHydrogenStorage(payload: ReadByIdsPayload): Promise<HydrogenComponentDto[]> {
    return this.digitalProductPassportCalculationService.readDPPForFillings(payload.ids);
  }

  //This function should replace readGeneralInformation, readProofOfOrigin and readProofOfSustainability
  @MessagePattern(DigitalProductPassportPatterns.READ_DIGITAL_PRODUCT_PASSPORT)
  async readDigitalProductPassport(payload: ReadByIdPayload): Promise<DigitalProductPassportDto> {
    return this.digitalProductPassportService.readDigitalProductPassport(payload.id);
  }

  //should be replaced
  @MessagePattern(DigitalProductPassportPatterns.READ_GENERAL_INFORMATION)
  async readGeneralInformation(payload: ReadByIdPayload): Promise<GeneralInformationEntity> {
    return this.digitalProductPassportService.readGeneralInformation(payload.id);
  }

  //should be replaced
  @MessagePattern(DigitalProductPassportPatterns.READ_PROOF_OF_ORIGIN)
  async readProofOfOrigin(payload: ReadByIdPayload): Promise<ProofOfOriginSectionEntity[]> {
    return this.digitalProductPassportService.readProofOfOrigin(payload.id);
  }

  //should be replaced
  @MessagePattern(DigitalProductPassportPatterns.READ_PROOF_OF_SUSTAINABILITY)
  async readProofOfSustainability(payload: ReadByIdPayload): Promise<ProofOfSustainabilityEntity> {
    return this.digitalProductPassportService.readProofOfSustainability(payload.id);
  }
}
