/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/messaging';
import { ProcessStepModule } from '../process-step/process-step.module';
import { DigitalProductPassportController } from './digital-product-passport.controller';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { ProvenanceModule } from './provenance/provenance.module';

@Module({
  imports: [
    ProcessStepModule,
    ProvenanceModule,
    ProcessStepModule,
    ProvenanceModule,
    Broker.getGeneralSvcBroker(),
  ],
  controllers: [DigitalProductPassportController],
  providers: [DigitalProductPassportService],
  exports: [DigitalProductPassportService],
})
export class DigitalProductPassportModule {}
