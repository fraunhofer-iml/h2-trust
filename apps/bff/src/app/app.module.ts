/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigurationModule, KeycloakConfigurationService } from '@h2-trust/configuration';
import { BottlingModule } from './bottling/bottling.module';
import { CompanyModule } from './company/company.module';
import { FileDownloadModule } from './file-download/file-download.module';
import { PowerAccessApprovalModule } from './power-access-approval/power-access-approval.module';
import { ProductionModule } from './production/production.module';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    BottlingModule,
    CompanyModule,
    PowerAccessApprovalModule,
    ProductionModule,
    UnitModule,
    UserModule,
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigurationService,
      imports: [ConfigurationModule],
    }),
    FileDownloadModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
