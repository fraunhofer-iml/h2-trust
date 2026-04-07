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
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from './proof-of-sustainability/proof-of-sustainability.service';
import { ProvenanceModule } from './provenance/provenance.module';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Module({
  imports: [
    ProcessStepModule,
    ProvenanceModule,
    ProcessStepModule,
    ProvenanceModule,
    new Broker().getGeneralSvcBroker(),
  ],
  controllers: [DigitalProductPassportController],
  providers: [DigitalProductPassportService, ProofOfSustainabilityService, ProofOfOriginService, RedComplianceService],
  exports: [DigitalProductPassportService],
})
export class DigitalProductPassportModule {}
