/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerAs } from '@nestjs/config';

export const PROCESS_SVC_CONFIGURATION_IDENTIFIER = 'process-svc-configuration';

export interface ProcessSvcConfiguration {
  productionChunkSize: number;
}

export default registerAs(PROCESS_SVC_CONFIGURATION_IDENTIFIER, () => ({
  productionChunkSize: parseInt(process.env['PRODUCTION_CHUNK_SIZE'] || '50'),
}));
