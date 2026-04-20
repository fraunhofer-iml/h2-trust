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
import { DigitalProductPassportService } from './digital-product-passport.service';
import { DigitalProductPassportEntity } from '@h2-trust/contracts';

@Controller()
export class DigitalProductPassportController {
  constructor(private readonly digitalProductPassportService: DigitalProductPassportService) {}

  @MessagePattern(DigitalProductPassportPatterns.READ_DIGITAL_PRODUCT_PASSPORT)
  async readDigitalProductPassport(payload: ReadByIdPayload): Promise<DigitalProductPassportEntity> {
    return this.digitalProductPassportService.readDigitalProductPassport(payload.id);
  }
}
