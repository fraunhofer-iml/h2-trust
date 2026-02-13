/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { DigitalProductPassportDto } from '@h2-trust/api';
import { DigitalProductPassportCalculationService } from './digital-product-passport.calculation.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(private readonly digitalProductPassportCalculationService: DigitalProductPassportCalculationService) {}

  async readDigitalProductPassport(processStepId: string): Promise<DigitalProductPassportDto> {
    return this.digitalProductPassportCalculationService.readDigitalProductPassport(processStepId);
  }
}
