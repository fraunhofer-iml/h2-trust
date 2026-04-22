/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerAs } from '@nestjs/config';
import { requireEnv } from '@h2-trust/utils';

export const BFF_CONFIGURATION_IDENTIFIER = 'bff-configuration';

export interface BffConfiguration {
  port: number;
  swaggerPath: string;
}

export default registerAs(BFF_CONFIGURATION_IDENTIFIER, () => ({
  port: parseInt(requireEnv('API_PORT')),
  swaggerPath: requireEnv('SWAGGER_PATH'),
}));
