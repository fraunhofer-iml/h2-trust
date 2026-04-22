/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { CompanyEntity } from '@h2-trust/contracts/entities';
import { CompanyRepository } from '@h2-trust/database';

@Injectable()
export class CompanyService {
  constructor(private readonly repository: CompanyRepository) {}

  async findAll(): Promise<CompanyEntity[]> {
    return this.repository.findAll();
  }
}
