/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { RedCompliancePairingService } from './red-compliance.pairs.service';
import { RedComplianceService } from './red-compliance.service';

@Module({
  imports: [new Broker().getProcessSvcBroker(), new Broker().getGeneralSvcBroker()],
  providers: [RedComplianceService, RedCompliancePairingService],
  exports: [RedComplianceService],
})
export class RedComplianceModule {}
