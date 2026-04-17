/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@h2-trust/database';
import { PowerPurchaseAgreementController } from './power-purchase-agreement.controller';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PowerPurchaseAgreementController],
  providers: [PowerPurchaseAgreementService],
})
export class PowerPurchaseAgreementModule {}
