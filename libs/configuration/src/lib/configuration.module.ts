/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationService } from './configuration.service';
import bffConfiguration from './configurations/bff.configuration';
import batchSvcConfiguration from './configurations/batch-svc.configuration';
import globalConfiguration from './configurations/global.configuration';
import keycloakConfiguration from './configurations/keycloak.configuration';
import generalSvcConfiguration from './configurations/general-svc.configuration';
import { KeycloakConfigurationService } from './keycloak.configuration.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../../.env'],
      isGlobal: true,
      cache: true,
      load: [
        bffConfiguration,
        batchSvcConfiguration,
        globalConfiguration,
        keycloakConfiguration,
        generalSvcConfiguration,
      ],
    }),
  ],
  controllers: [],
  providers: [ConfigurationService, KeycloakConfigurationService],
  exports: [ConfigurationService, KeycloakConfigurationService],
})
export class ConfigurationModule {}
