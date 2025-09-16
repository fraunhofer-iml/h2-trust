/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalStatus } from '../../../enums';
import { CompanyDtoMock } from '../../company';
import { PowerProductionUnitOverviewDtoMock } from '../../unit/mocks/power-production-unit-overview-dto.mock';
import { PowerAccessApprovalDto } from '../power-access-approval.dto';

export const PowerAccessApprovalDtoMock = <PowerAccessApprovalDto[]>[
  <PowerAccessApprovalDto>{
    id: 'paa-1',
    hydrogenProducer: CompanyDtoMock[1],
    powerProducer: CompanyDtoMock[0],
    powerProductionUnit: PowerProductionUnitOverviewDtoMock[0],
    status: PowerAccessApprovalStatus.APPROVED,
    energySource: 'WIND_ENERGY',
  },
];
