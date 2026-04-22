/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/messaging';
import { UserService } from '../user/user.service';
import { PowerPurchaseAgreementController } from './power-purchase-agreement.controller';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

@Module({
  imports: [Broker.getGeneralSvcBroker()],
  controllers: [PowerPurchaseAgreementController],
  providers: [PowerPurchaseAgreementService, UserService],
})
export class PowerPurchaseAgreementModule {}
