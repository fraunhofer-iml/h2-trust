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
import { AccountingPeriodMatchingService } from './accounting-period-matching.service';
import { ProductionImportService } from './production-import.service';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  imports: [ConfigurationModule, new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), DatabaseModule],
  controllers: [ProductionController],
  providers: [ProductionService, AccountingPeriodMatchingService, ProductionImportService],
})
export class ProductionModule {}
