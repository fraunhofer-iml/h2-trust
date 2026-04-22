/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CompanyEntity } from '@h2-trust/contracts/entities';
import { CompanyMessagePatterns } from '@h2-trust/messaging';
import { CompanyService } from './company.service';

@Controller()
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @MessagePattern(CompanyMessagePatterns.READ)
  async findAll(): Promise<CompanyEntity[]> {
    return this.service.findAll();
  }
}
