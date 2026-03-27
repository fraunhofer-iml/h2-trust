/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { DatabaseModule } from '@h2-trust/database';
import { TransportationService } from '../transportation/transportation.service';
import { ProcessStepService } from './process-step.service';

@Module({
  imports: [ConfigurationModule, DatabaseModule],
  providers: [ProcessStepService, TransportationService],
  exports: [ProcessStepService],
})
export class ProcessStepModule {}
