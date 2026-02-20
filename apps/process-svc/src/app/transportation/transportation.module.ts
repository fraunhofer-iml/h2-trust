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
import { ProcessStepModule } from '../process-step/process-step.module';
import { TransportationController } from './transportation.controller';
import { TransportationService } from './transportation.service';

@Module({
  imports: [ConfigurationModule, DatabaseModule, ProcessStepModule],
  controllers: [TransportationController],
  providers: [TransportationService],
})
export class TransportationModule {}
