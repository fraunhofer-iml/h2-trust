/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { PowerPurchaseAgreementService } from '../services/power-purchase-agreement/power-purchase-agreement.service';
import { QueryKeyPrefix } from './shared-query-keys';

export const ppaRequestsQueryOptions = (
  ppaService: PowerPurchaseAgreementService,
  role: PpaRequestRole,
  status?: PowerPurchaseAgreementStatus,
) => ({
  queryKey: [QueryKeyPrefix.PPA_REQUESTS, role, status],
  queryFn: () => ppaService.getPpaRequests(role, status),
});
