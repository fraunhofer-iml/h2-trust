/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { EmissionComputationService } from './emission.service';
import { PowerUnitLoader } from './power-unit.loader';

@Module({
  imports: [new Broker().getGeneralSvcBroker(), new Broker().getBatchSvcBroker(), new Broker().getProcessSvcBroker()],
  controllers: [],
  providers: [EmissionComputationService, PowerUnitLoader],
  exports: [EmissionComputationService],
})
export class EmissionModule { }
