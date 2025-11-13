/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { LineageContextService } from './lineage-context.service';
import { LineageController } from './lineage.controller';
import { ProcessLineageService } from './process-lineage.service';

@Module({
  imports: [new Broker().getBatchSvcBroker()],
  controllers: [LineageController],
  providers: [LineageContextService, ProcessLineageService],
  exports: [LineageContextService],
})
export class LineageModule { }
