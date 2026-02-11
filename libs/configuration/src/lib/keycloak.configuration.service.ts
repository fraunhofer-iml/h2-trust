/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class KeycloakConfigurationService implements KeycloakConnectOptionsFactory {
  constructor(private readonly configurationService: ConfigurationService) { }

  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: this.configurationService.getGlobalConfiguration().keycloak.url,
      realm: this.configurationService.getGlobalConfiguration().keycloak.realm,
      clientId: this.configurationService.getGlobalConfiguration().keycloak.clientId,
      secret: this.configurationService.getGlobalConfiguration().keycloak.clientSecret,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
      useNestLogger: true,
    };
  }
}
