/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { ProcessStepModule } from './process-step/process-step.module';

@Module({
  imports: [ConfigurationModule, ProcessStepModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
