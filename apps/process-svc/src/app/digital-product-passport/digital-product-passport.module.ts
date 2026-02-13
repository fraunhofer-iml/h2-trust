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
import { DigitalProductPassportCalculationService } from './digital-product-passport.calculation.service';
import { DigitalProductPassportController } from './digital-product-passport.controller';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { EmissionService } from './proof-of-origin/emission.service';
import { HydrogenBottlingSectionService } from './proof-of-origin/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './proof-of-origin/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './proof-of-origin/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './proof-of-origin/hydrogen-transportation-section.service';
import { PowerSupplyClassificationService } from './proof-of-origin/power-supply-classification.service';
import { WaterSupplyClassificationService } from './proof-of-origin/water-supply-classification.service';
import { ProvenanceModule } from './provenance/provenance.module';
import { RedComplianceModule } from './red-compliance/red-compliance.module';

@Module({
  imports: [
    ProcessStepModule,
    RedComplianceModule,
    new Broker().getGeneralSvcBroker(),
    ProvenanceModule,
    ProcessStepModule,
    ProvenanceModule,
    RedComplianceModule,
  ],
  controllers: [DigitalProductPassportController],
  providers: [
    DigitalProductPassportService,
    DigitalProductPassportCalculationService,
    EmissionService,
    HydrogenBottlingSectionService,
    HydrogenProductionSectionService,
    HydrogenStorageSectionService,
    HydrogenTransportationSectionService,
    PowerSupplyClassificationService,
    WaterSupplyClassificationService,
  ],
  exports: [DigitalProductPassportCalculationService],
})
export class DigitalProductPassportModule {}
