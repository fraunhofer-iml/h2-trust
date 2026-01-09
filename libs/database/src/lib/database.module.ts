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
  StagedProductionRepository,
  UnitRepository,
  UserRepository,
} from './repositories';

@Module({
  controllers: [],
  providers: [
    PrismaService,
    BatchRepository,
    CompanyRepository,
    DocumentRepository,
    PowerAccessApprovalRepository,
    PowerProductionTypeRepository,
    ProcessStepRepository,
    StagedProductionRepository,
    UnitRepository,
    UserRepository,
  ],
  exports: [
    PrismaService,
    BatchRepository,
    CompanyRepository,
    DocumentRepository,
    PowerAccessApprovalRepository,
    PowerProductionTypeRepository,
    ProcessStepRepository,
    StagedProductionRepository,
    UnitRepository,
    UserRepository,
  ],
})
export class DatabaseModule {}
