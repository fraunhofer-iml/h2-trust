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
  logger = new Logger(ConfigurationService.name);

  constructor(private readonly configService: ConfigService) {}

  public getBffConfiguration(): BffConfiguration {
    const bffConfiguration = this.configService.get<BffConfiguration>(BFF_CONFIGURATION_IDENTIFIER);

    if (!bffConfiguration) {
      const errorMessage = 'Environment variables for bff service configuration missing.';
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return bffConfiguration;
  }

  public getGeneralSvcConfiguration(): GeneralSvcConfiguration {
    const generalSvcConfiguration = this.configService.get<GeneralSvcConfiguration>(
      GENERAL_SVC_CONFIGURATION_IDENTIFIER,
    );

    if (!generalSvcConfiguration) {
      const errorMessage = 'Environment variables for general service configuration missing.';
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return generalSvcConfiguration;
  }

  public getGlobalConfiguration(): GlobalConfiguration {
    const globalConfiguration = this.configService.get<GlobalConfiguration>(GLOBAL_CONFIGURATION_IDENTIFIER);

    if (!globalConfiguration) {
      const msg = 'Environment variables for global configuration missing.';
      this.logger.error(msg);
      throw new Error(msg);
    }

    return globalConfiguration;
  }

  public getProcessSvcConfiguration(): ProcessSvcConfiguration {
    const processSvcConfiguration = this.configService.get<ProcessSvcConfiguration>(
      PROCESS_SVC_CONFIGURATION_IDENTIFIER,
    );

    if (!processSvcConfiguration) {
      const errorMessage = 'Environment variables for process service configuration missing.';
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return processSvcConfiguration;
  }
}
