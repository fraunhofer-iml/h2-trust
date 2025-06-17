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
      authServerUrl: this.configurationService.getKeycloakConfiguration().url,
      realm: this.configurationService.getKeycloakConfiguration().realm,
      clientId: this.configurationService.getKeycloakConfiguration().clientId,
      secret: this.configurationService.getKeycloakConfiguration().clientSecret,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    };
  }
}
