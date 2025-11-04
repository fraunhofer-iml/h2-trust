/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerAs } from '@nestjs/config';

export const GENERAL_SVC_CONFIGURATION_IDENTIFIER = 'general-svc-configuration';

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface GeneralSvcConfiguration {}

export default registerAs(GENERAL_SVC_CONFIGURATION_IDENTIFIER, () => ({}));
