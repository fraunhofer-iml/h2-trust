/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompaniesService } from '../services/companies/companies.service';
import { QueryKeyPrefix } from './shared-query-keys';

export const companiesQueryOptions = (companiesService: CompaniesService) => ({
  queryKey: [QueryKeyPrefix.COMPANIES],
  queryFn: () => companiesService.getCompanies(),
});
