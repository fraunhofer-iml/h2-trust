/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { getProcessSvcBroker } from '@h2-trust/messaging';
import { UserModule } from '../user/user.module';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';

@Module({
  imports: [UserModule, getProcessSvcBroker()],
  controllers: [ProcessStepController],
  providers: [ProcessStepService],
})
export class ProcessStepModule {}
