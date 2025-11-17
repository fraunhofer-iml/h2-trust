/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProofOfSustainabilityService } from './proof-of-sustainability.service';
import { EmissionModule } from '../emission/emission.module';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker(), EmissionModule],
  providers: [ProofOfSustainabilityService],
  exports: [ProofOfSustainabilityService],
})
export class ProofOfSustainabilityModule {}
