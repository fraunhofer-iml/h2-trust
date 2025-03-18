/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BATCH_SVC_CONFIGURATION_IDENTIFIER, BatchSvcConfiguration } from './configurations/batch-svc.configuration';
import { BFF_CONFIGURATION_IDENTIFIER, BffConfiguration } from './configurations/bff.configuration';
import {
  GENERAL_SVC_CONFIGURATION_IDENTIFIER,
  GeneralSvcConfiguration,
} from './configurations/general-svc.configuration';
import { GLOBAL_CONFIGURATION_IDENTIFIER, GlobalConfiguration } from './configurations/global.configuration';
import { KEYCLOAK_CONFIGURATION_IDENTIFIER, KeycloakConfiguration } from './configurations/keycloak.configuration';

@Injectable()
export class ConfigurationService {
  logger = new Logger(ConfigurationService.name);

  constructor(private readonly configService: ConfigService) {}

  public getBatchSvcConfiguration(): BatchSvcConfiguration | undefined {
    return this.configService.get<BatchSvcConfiguration>(BATCH_SVC_CONFIGURATION_IDENTIFIER);
  }

  public getBffConfiguration(): BffConfiguration | undefined {
    return this.configService.get<BffConfiguration>(BFF_CONFIGURATION_IDENTIFIER);
  }

  public getGeneralSvcConfiguration(): GeneralSvcConfiguration | undefined {
    return this.configService.get<GeneralSvcConfiguration>(GENERAL_SVC_CONFIGURATION_IDENTIFIER);
  }

  public getGlobalConfiguration(): GlobalConfiguration | undefined {
    return this.configService.get<GlobalConfiguration>(GLOBAL_CONFIGURATION_IDENTIFIER);
  }

  public getKeycloakConfiguration(): KeycloakConfiguration {
    const keycloakConfiguration = this.configService.get<KeycloakConfiguration>(KEYCLOAK_CONFIGURATION_IDENTIFIER);

    if (!keycloakConfiguration) {
      const msg = 'Environment variables for keycloak configuration missing!';
      this.logger.error(msg);
      throw new Error(msg);
    }

    return keycloakConfiguration;
  }
}
