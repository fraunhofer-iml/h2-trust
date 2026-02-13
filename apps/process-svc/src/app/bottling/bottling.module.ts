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
import { DigitalProductPassportModule } from '../digital-product-passport/digital-product-passport.module';
import { ProcessStepModule } from '../process-step/process-step.module';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    ProcessStepModule,
    DigitalProductPassportModule,
    StorageModule,
    new Broker().getGeneralSvcBroker(),
  ],
  controllers: [BottlingController],
  providers: [BottlingService],
})
export class BottlingModule {}
