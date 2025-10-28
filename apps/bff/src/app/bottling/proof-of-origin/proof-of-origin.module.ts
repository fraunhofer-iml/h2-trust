/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { HydrogenProductionSectionAssembler } from './assembler/hydrogen-production-section.assembler';
import { ProofOfOriginDtoAssembler } from './assembler/proof-of-origin-dto.assembler';
import { EnergySourceClassificationService } from './classification/energy-source-classification.service';
import { ProofOfOriginAssembler } from './proof-of-origin.assembler';
import { ProofOfOriginService } from './proof-of-origin.service';
import { BottlingSectionService } from './sections/bottling-section.service';
import { InputMediaSectionService } from './sections/input-media-section.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  providers: [
    ProofOfOriginService,
    ProofOfOriginAssembler,
    BottlingSectionService,
    HydrogenProductionSectionAssembler,
    InputMediaSectionService,
    ProofOfOriginDtoAssembler,
    EnergySourceClassificationService,
  ],
  exports: [ProofOfOriginService],
})
export class ProofOfOriginModule {}
