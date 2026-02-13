/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { DigitalProductPassportModule } from './digital-product-passport/digital-product-passport.module';
import { ProcessStepModule } from './process-step/process-step.module';
import { ProductionModule } from './production/production.module';
import { BottlingModule } from './bottling/bottling.module';

@Module({
  imports: [DigitalProductPassportModule, ProcessStepModule, ProductionModule, BottlingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
