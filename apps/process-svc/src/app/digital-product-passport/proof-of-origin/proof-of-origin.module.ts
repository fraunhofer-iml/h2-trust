/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProcessStepModule } from '../../process-step/process-step.module';
import { ProvenanceModule } from '../provenance/provenance.module';
import { EmissionService } from './emission.service';
import { HydrogenBottlingSectionService } from './hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './hydrogen-transportation-section.service';
import { PowerSupplyClassificationService } from './power-supply-classification.service';
import { ProofOfOriginService } from './proof-of-origin.service';
import { WaterSupplyClassificationService } from './water-supply-classification.service';

@Module({
  imports: [ProvenanceModule, ProcessStepModule, new Broker().getGeneralSvcBroker()],
  providers: [
    EmissionService,
    HydrogenBottlingSectionService,
    HydrogenProductionSectionService,
    HydrogenStorageSectionService,
    HydrogenTransportationSectionService,
    PowerSupplyClassificationService,
    WaterSupplyClassificationService,
    ProofOfOriginService,
  ],
  exports: [EmissionService, ProofOfOriginService],
})
export class ProofOfOriginModule {}
