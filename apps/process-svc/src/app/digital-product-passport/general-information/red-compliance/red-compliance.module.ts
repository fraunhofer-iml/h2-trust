/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProvenanceModule } from '../../provenance/provenance.module';
import { RedCompliancePairingService } from './red-compliance-pairing.service';
import { RedComplianceService } from './red-compliance.service';

@Module({
  imports: [ProvenanceModule, new Broker().getGeneralSvcBroker()],
  providers: [RedCompliancePairingService, RedComplianceService],
  exports: [RedComplianceService],
})
export class RedComplianceModule {}
