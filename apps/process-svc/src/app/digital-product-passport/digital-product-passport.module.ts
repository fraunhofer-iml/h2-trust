/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProcessStepModule } from '../process-step/process-step.module';
import { DigitalProductPassportController } from './digital-product-passport.controller';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { ProofOfOriginModule } from './proof-of-origin/proof-of-origin.module';
import { ProvenanceModule } from './provenance/provenance.module';
import { RedComplianceModule } from './red-compliance/red-compliance.module';

@Module({
  imports: [
    ProcessStepModule,
    ProofOfOriginModule,
    ProvenanceModule,
    RedComplianceModule,
    new Broker().getGeneralSvcBroker(),
  ],
  controllers: [DigitalProductPassportController],
  providers: [DigitalProductPassportService],
})
export class DigitalProductPassportModule {}
