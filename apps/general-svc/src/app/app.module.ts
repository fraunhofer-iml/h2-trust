/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { CompanyModule } from './company/company.module';
import { PowerAccessApprovalModule } from './power-access-approval/power-access-approval.module';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigurationModule, CompanyModule, PowerAccessApprovalModule, UnitModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
