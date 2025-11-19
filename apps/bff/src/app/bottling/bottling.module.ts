/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { UserService } from '../user/user.service';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';
import { DigitalProductPassportModule } from './digital-product-passport/digital-product-passport.module';

@Module({
  imports: [
    new Broker().getBatchSvcBroker(),
    new Broker().getGeneralSvcBroker(),
    DigitalProductPassportModule,
  ],
  controllers: [BottlingController],
  providers: [BottlingService, UserService],
})
export class BottlingModule { }
