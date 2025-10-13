/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitCreateDto } from '@h2-trust/api';

export const PowerProductionUnitCreateDtoMock = <PowerProductionUnitCreateDto[]>[
  {
    unitType: 'POWER_PRODUCTION',
    name: 'Onshore Wind Turbine 3000',
    owner: 'Wind Power Corp',
    certifiedBy: 'TÜV Nord',
    operator: 'Wind Operations Ltd',
    manufacturer: 'WindTech Industries',
    modelType: 'WT-3000',
    modelNumber: 'WTP-789-X',
    serialNumber: 'SN123456789',
    commissionedOn: new Date('2023-01-15').toISOString(),
    mastrNumber: 'MASTR123456',
    address: {
      street: 'Wind Park Street 42',
      postalCode: '12345',
      city: 'Windville',
      state: 'North Rhine-Westphalia',
      country: 'Germany',
    },
    powerProductionType: 'WIND_TURBINE',
    biddingZone: 'DE-LU',
    gridLevel: 'HIGH_VOLTAGE',
    ratedPower: 3000,
    electricityMeterNumber: 'EM789012',
    gridOperator: 'Regional Grid Operator GmbH',
    gridConnectionNumber: 'GC456789',
    decommissioningPlannedOn: new Date('2043-01-15').toISOString(),
  },
];
