/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { BatchRepository } from './batch';
import { DocumentRepository } from './document';
import { PrismaService } from './prisma.service';
import { ProcessStepRepository } from './process-step';
import { UnitRepository } from './unit';
import { UserRepository } from './user';


@Module({
  controllers: [],
  providers: [
    PrismaService,
    UserRepository,
    UnitRepository,
    ProcessStepRepository,
    BatchRepository,
    DocumentRepository,
  ],
  exports: [PrismaService, UserRepository, UnitRepository, ProcessStepRepository, BatchRepository, DocumentRepository],
})
export class DatabaseModule {}
