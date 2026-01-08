/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { ProductionModule } from './production/production.module';
import { ProvenanceModule } from './provenance/provenance.module';
import { StagedProductionCleanupModule } from './tasks/staged-production-cleanup.module';
import { RedComplianceModule } from './red-compliance/red-compliance.module';

@Module({
  imports: [ConfigurationModule, ProductionModule, ProvenanceModule, RedComplianceModule, StagedProductionCleanupModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
