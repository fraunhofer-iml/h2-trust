/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DigitalProductPassportEntity, DigitalProductPassportPatterns, ReadByIdPayload } from '@h2-trust/amqp';
import { DigitalProductPassportService } from './digital-product-passport.service';

@Controller()
export class DigitalProductPassportController {
  constructor(private readonly digitalProductPassportService: DigitalProductPassportService) { }

  @MessagePattern(DigitalProductPassportPatterns.DETERMINE_RFNBO_TYPE)
  async determineRfnboType(payload: ReadByIdPayload): Promise<string> {
    return this.digitalProductPassportService.determineRfnboTypeForProcessStepId(payload.id);
  }

  @MessagePattern(DigitalProductPassportPatterns.READ_DIGITAL_PRODUCT_PASSPORT)
  async readDigitalProductPassport(payload: ReadByIdPayload): Promise<DigitalProductPassportEntity> {
    return this.digitalProductPassportService.readDigitalProductPassportForProcessStepId(payload.id);
  }
}
