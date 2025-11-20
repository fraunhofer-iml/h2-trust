/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { EnergySourceClassificationService } from './classification/energy-source-classification.service';
import { WaterClassificationService } from './classification/water-classification.service';
import { DigitalProductPassportService } from './digital-product-passport.service';
import { EmissionComputationService } from './emission-computation.service';
import { HydrogenBottlingSectionService } from './section/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './section/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './section/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './section/hydrogen-transportation-section.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  providers: [
    DigitalProductPassportService,
    HydrogenBottlingSectionService,
    HydrogenProductionSectionService,
    HydrogenStorageSectionService,
    HydrogenTransportationSectionService,
    EnergySourceClassificationService,
    WaterClassificationService,
    EmissionComputationService,
  ],
  exports: [DigitalProductPassportService],
})
export class DigitalProductPassportModule {}
