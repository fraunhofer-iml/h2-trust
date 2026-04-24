/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

//TODO-LG: We still need to clarify how the hydrogen producer obtains power from the grid. Until then, a constant will be used to define the default provider for grid power.
export const DefaultGridProvider = {
  DEFAULT_GRID_PROVIDER_COMPANY_ID: 'company-grid-0',
} as const;
