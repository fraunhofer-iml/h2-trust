/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProcessStepModule } from '../../process-step/process-step.module';
import { RedComplianceModule } from './red-compliance/red-compliance.module';
import { GeneralInformationService } from './general-information.service';

@Module({
  imports: [ProcessStepModule, RedComplianceModule, new Broker().getGeneralSvcBroker()],
  providers: [GeneralInformationService],
  exports: [GeneralInformationService],
})
export class GeneralInformationModule {}
