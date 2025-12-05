/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProvenanceController } from './provenance.controller';
import { ProvenanceService } from './provenance.service';
import { TraversalService } from './traversal.service';
import { GraphBuilderService } from './graph-builder.service';
import { ProvenanceAssembler } from './provenance.assembler';

@Module({
  imports: [new Broker().getBatchSvcBroker()],
  controllers: [ProvenanceController],
  providers: [ProvenanceService, TraversalService, GraphBuilderService, ProvenanceAssembler],
  exports: [ProvenanceService],
})
export class ProvenanceModule {}
