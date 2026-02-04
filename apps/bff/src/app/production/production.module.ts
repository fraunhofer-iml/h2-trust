/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { StorageModule } from '@h2-trust/storage';
import { UserModule } from '../user/user.module';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  imports: [StorageModule, UserModule, new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
