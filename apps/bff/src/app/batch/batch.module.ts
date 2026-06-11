/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { getProcessSvcBroker } from '@h2-trust/messaging';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  providers: [BatchService],
  imports: [getProcessSvcBroker()],
  controllers: [BatchController],
})
export class BatchModule {}
