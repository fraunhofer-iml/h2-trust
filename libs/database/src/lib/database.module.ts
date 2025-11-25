/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  BatchRepository,
  CompanyRepository,
  DocumentRepository,
  PowerAccessApprovalRepository,
  PowerProductionTypeRepository,
  ProcessStepRepository,
  UnitRepository,
  UserRepository,
} from './repositories';
import { TempAccountingPeriodRepository } from './repositories/temp-accounting-period.repository';

@Module({
  controllers: [],
  providers: [
    PrismaService,
    UserRepository,
    UnitRepository,
    ProcessStepRepository,
    BatchRepository,
    DocumentRepository,
    PowerAccessApprovalRepository,
    PowerProductionTypeRepository,
    CompanyRepository,
    TempAccountingPeriodRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    UnitRepository,
    ProcessStepRepository,
    BatchRepository,
    DocumentRepository,
    PowerAccessApprovalRepository,
    PowerProductionTypeRepository,
    CompanyRepository,
    TempAccountingPeriodRepository,
  ],
})
export class DatabaseModule {}
