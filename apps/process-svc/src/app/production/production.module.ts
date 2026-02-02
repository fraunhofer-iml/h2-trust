/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ConfigurationModule } from '@h2-trust/configuration';
import { DatabaseModule } from '@h2-trust/database';
import { StorageModule } from '@h2-trust/storage';
import { ProcessStepModule } from '../process-step/process-step.module';
import { ProductionCreationService } from './production-creation.service';
import { ProductionImportService } from './production-import.service';
import { ProductionController } from './production.controller';
import { StagedProductionCleanupModule } from './tasks/staged-production-cleanup.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    ProcessStepModule,
    StagedProductionCleanupModule,
    StorageModule,
    new Broker().getGeneralSvcBroker(),
  ],
  controllers: [ProductionController],
  providers: [ProductionCreationService, ProductionImportService],
})
export class ProductionModule {}
