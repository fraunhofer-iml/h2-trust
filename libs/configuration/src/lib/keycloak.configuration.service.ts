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
  constructor(private config: ConfigurationService) {}

  createKeycloakConnectOptions(): KeycloakConnectOptions {
    return {
      authServerUrl: this.config.getKeycloakConfiguration().url,
      realm: this.config.getKeycloakConfiguration().realm,
      clientId: this.config.getKeycloakConfiguration().clientId,
      secret: this.config.getKeycloakConfiguration().clientSecret,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    };
  }
}
