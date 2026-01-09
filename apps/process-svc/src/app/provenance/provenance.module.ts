/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ProvenanceController } from './provenance.controller';
import { ProvenanceService } from './provenance.service';
import { TraversalService } from './traversal.service';
import { ProcessStepModule } from '../process-step/process-step.module';

@Module({
  imports: [ProcessStepModule],
  controllers: [ProvenanceController],
  providers: [ProvenanceService, TraversalService],
  exports: [ProvenanceService],
})
export class ProvenanceModule {}
