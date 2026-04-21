/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BFF_CONFIGURATION_IDENTIFIER, BffConfiguration } from './configurations/bff.configuration';
import {
  GENERAL_SVC_CONFIGURATION_IDENTIFIER,
  GeneralSvcConfiguration,
} from './configurations/general-svc.configuration';
import { GLOBAL_CONFIGURATION_IDENTIFIER, GlobalConfiguration } from './configurations/global.configuration';
import {
  PROCESS_SVC_CONFIGURATION_IDENTIFIER,
  ProcessSvcConfiguration,
} from './configurations/process-svc.configuration';

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);

  constructor(private readonly configService: ConfigService) {}

  public getBffConfiguration(): BffConfiguration {
    return this.getConfig<BffConfiguration>(BFF_CONFIGURATION_IDENTIFIER, 'bff service');
  }

  public getGeneralSvcConfiguration(): GeneralSvcConfiguration {
    return this.getConfig<GeneralSvcConfiguration>(GENERAL_SVC_CONFIGURATION_IDENTIFIER, 'general service');
  }

  public getGlobalConfiguration(): GlobalConfiguration {
    return this.getConfig<GlobalConfiguration>(GLOBAL_CONFIGURATION_IDENTIFIER, 'global');
  }

  public getProcessSvcConfiguration(): ProcessSvcConfiguration {
    return this.getConfig<ProcessSvcConfiguration>(PROCESS_SVC_CONFIGURATION_IDENTIFIER, 'process service');
  }

  private getConfig<T>(identifier: string, label: string): T {
    const config = this.configService.get<T>(identifier);

    if (!config) {
      const message = `Environment variables for ${label} configuration are missing.`;
      this.logger.error(message);
      throw new Error(message);
    }

    return config;
  }
}
