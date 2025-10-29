/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { EnergySourceClassificationService } from './classifications/energy-source-classification.service';
import { ProofOfOriginDtoAssembler } from './proof-of-origin-dto.assembler';
import { ProofOfOriginAssembler } from './proof-of-origin.assembler';
import { ProofOfOriginService } from './proof-of-origin.service';
import { HydrogenBottlingSectionService } from './sections/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './sections/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './sections/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './sections/hydrogen-transportation-section.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  providers: [
    ProofOfOriginService,
    ProofOfOriginAssembler,
    HydrogenBottlingSectionService,
    HydrogenProductionSectionService,
    HydrogenStorageSectionService,
    HydrogenTransportationSectionService,
    ProofOfOriginDtoAssembler,
    EnergySourceClassificationService,
  ],
  exports: [ProofOfOriginService],
})
export class ProofOfOriginModule {}
