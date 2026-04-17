/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class FeatureFlagService {
  constructor(private readonly configurationService: ConfigurationService) {}

  get verificationEnabled(): boolean {
    return this.configurationService.getGlobalConfiguration().featureFlags.verificationEnabled;
  }
}
