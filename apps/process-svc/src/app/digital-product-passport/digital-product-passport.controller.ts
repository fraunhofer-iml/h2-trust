/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DigitalProductPassportEntity } from '@h2-trust/contracts/entities';
import { ReadByIdPayload } from '@h2-trust/contracts/payloads';
import { DigitalProductPassportMessagePatterns } from '@h2-trust/messaging';
import { DigitalProductPassportService } from './digital-product-passport.service';

@Controller()
export class DigitalProductPassportController {
  constructor(private readonly digitalProductPassportService: DigitalProductPassportService) {}

  @MessagePattern(DigitalProductPassportMessagePatterns.READ)
  async readDigitalProductPassport(payload: ReadByIdPayload): Promise<DigitalProductPassportEntity> {
    return this.digitalProductPassportService.readDigitalProductPassport(payload.id);
  }
}
