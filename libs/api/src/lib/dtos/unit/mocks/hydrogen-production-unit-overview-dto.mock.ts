/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionOverviewDto } from '@h2-trust/api';

export const HydrogenProductionUnitOverviewDtoMock = <HydrogenProductionOverviewDto[]>[
  {
    id: 'hydrogen-prod-1',
    name: 'Hydrogen Production Unit 1',
    ratedPower: 1000,
    typeName: 'Electrolysis',
    producing: true,
    powerAccessApprovalStatus: true,
    powerProducerId: 'power-prod-1',
    powerProducerName: 'Solar Plant Alpha',
    hydrogenStorageUnit: {
      id: 'storage-1',
      name: 'Storage Unit 1',
    },
  },
  {
    id: 'hydrogen-prod-2',
    name: 'Hydrogen Production Unit 2',
    ratedPower: 2000,
    typeName: undefined,
    producing: false,
    powerAccessApprovalStatus: false,
    powerProducerId: 'power-prod-2',
    powerProducerName: 'Wind Farm Beta',
    hydrogenStorageUnit: undefined,
  },
];
