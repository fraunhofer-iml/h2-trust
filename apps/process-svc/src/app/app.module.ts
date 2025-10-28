/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { EmissionModule } from './emission/emission.module';
import { LineageModule } from './lineage/lineage.module';
import { ProductionModule } from './production/production.module';

@Module({
  imports: [ConfigurationModule, ProductionModule, LineageModule, EmissionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
