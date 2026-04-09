/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PpaRequestRole } from '@h2-trust/domain';
import { QUERY_CONFIG } from '../constants/query-config';
import { PowerAccessApprovalService } from '../services/power-access-approvals/power-access-approvals.service';
import { QUERY_KEYS } from './shared-query-keys';

export const ppaRequestsQueryOptions = (unitsService: PowerAccessApprovalService, role: PpaRequestRole) => ({
  queryKey: [...QUERY_KEYS.PPA_REQUESTS, role],
  queryFn: () => unitsService.getPpaRequests(role),
  staleTime: QUERY_CONFIG.STALE_TIME,
});
