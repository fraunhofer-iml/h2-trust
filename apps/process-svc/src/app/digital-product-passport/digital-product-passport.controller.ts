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
import { DigitalProductPassportDto } from '@h2-trust/api';
import { DigitalProductPassportService } from './digital-product-passport.service';

@Controller()
export class DigitalProductPassportController {
  constructor(
    private readonly digitalProductPassportService: DigitalProductPassportService,
    private readonly digitalProductPassportCalculationService: DigitalProductPassportService,
  ) {}

  @MessagePattern(DigitalProductPassportPatterns.READ_RFNBO_STATUS)
  async getDPPForHydrogenStorage(payload: ReadByIdPayload): Promise<string> {
    return this.digitalProductPassportCalculationService.getRfnboType(payload.id);
  }

  //TODO-LG: change the return type to entity
  @MessagePattern(DigitalProductPassportPatterns.READ_DIGITAL_PRODUCT_PASSPORT)
  async readDigitalProductPassport(payload: ReadByIdPayload): Promise<DigitalProductPassportDto> {
    return this.digitalProductPassportService.readDigitalProductPassport(payload.id);
  }
}
