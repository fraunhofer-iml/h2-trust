/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { DatabaseModule } from '@h2-trust/database';
import { StorageModule } from '@h2-trust/storage';
import { BottlingService } from './bottling/bottling.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { TransportationService } from './transportation/transportation.service';
import { ConfigurationModule } from '@h2-trust/configuration';

@Module({
  imports: [ConfigurationModule, DatabaseModule, StorageModule, new Broker().getGeneralSvcBroker()],
  controllers: [ProcessStepController],
  providers: [
    BottlingService,
    ProcessStepService,
    TransportationService,
  ],
  exports: [BottlingService, ProcessStepService],
})
export class ProcessStepModule { }
