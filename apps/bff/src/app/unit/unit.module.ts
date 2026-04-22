/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/messaging';
import { UserModule } from '../user/user.module';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

@Module({
  imports: [UserModule, Broker.getGeneralSvcBroker()],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
