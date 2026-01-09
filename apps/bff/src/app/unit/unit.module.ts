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
import { PowerProductionUnitController } from './power-production-unit.controller';
import { HydrogenStorageUnitController } from './hydrogen-storage-unit.controller';
import { HydrogenProductionUnitController } from './hydrogen-production-unit.controller';
import { PowerProductionUnitController } from './power-production-unit.controller';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { PowerProductionUnitController } from './power-production-unit.controller';

@Module({
  imports: [new Broker().getGeneralSvcBroker()],
  controllers: [
    UnitController,
    PowerProductionUnitController,
    HydrogenProductionUnitController,
    HydrogenStorageUnitController,
  ],
  providers: [UnitService, UserService],
})
export class UnitModule {}
