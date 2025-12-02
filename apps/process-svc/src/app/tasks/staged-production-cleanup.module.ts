/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@h2-trust/database';
import { StagedProductionCleanupService } from './staged-production-cleanup.service';

@Module({ imports: [ScheduleModule.forRoot(), DatabaseModule], providers: [StagedProductionCleanupService] })
export class StagedProductionCleanupModule {}
