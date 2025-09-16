/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@h2-trust/database';
import { PowerAccessApprovalController } from './power-access-approval.controller';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PowerAccessApprovalController],
  providers: [PowerAccessApprovalService],
})
export class PowerAccessApprovalModule {}
