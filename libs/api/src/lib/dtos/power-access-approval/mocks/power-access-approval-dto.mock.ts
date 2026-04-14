/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnergySource, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDtoMock } from '../../company';
import { PowerProductionUnitOverviewDtoMock } from '../../unit/mocks/power-production-unit-overview-dto.mock';
import { PowerPurchaseAgreementDto } from '../power-purchase-agreement.dto';

export const PowerAccessApprovalDtoMock = <PowerPurchaseAgreementDto[]>[
  <PowerPurchaseAgreementDto>{
    id: 'paa-1',
    hydrogenProducer: CompanyDtoMock[1],
    powerProducer: CompanyDtoMock[0],
    powerProductionUnit: PowerProductionUnitOverviewDtoMock[0],
    status: PowerPurchaseAgreementStatus.APPROVED,
    energySource: EnergySource.WIND_ENERGY,
  },
];
