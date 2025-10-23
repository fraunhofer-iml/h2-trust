/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitCreateDto } from '@h2-trust/api';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';

export const HydrogenProductionUnitCreateDtoMock = <HydrogenProductionUnitCreateDto[]>[
  {
    unitType: UnitType.HYDROGEN_PRODUCTION,
    name: 'Hydrogen Production Unit 1',
    owner: 'Company A',
    operator: 'Operator A',
    manufacturer: 'Manufacturer A',
    modelType: 'Model X',
    modelNumber: 'MX-2025-001',
    serialNumber: 'SN001',
    mastrNumber: 'MASTR001',
    certifiedBy: 'Certification Body A',
    commissionedOn: '2025-01-01',
    address: {
      street: 'Main Street',
      postalCode: '12345',
      city: 'Berlin',
      state: 'Berlin',
      country: 'Germany',
    },
    method: HydrogenProductionMethod.ELECTROLYSIS,
    technology: HydrogenProductionTechnology.AEL,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: 1000,
    pressure: 30,
    waterConsumption: 2,
  },
  {
    unitType: UnitType.HYDROGEN_PRODUCTION,
    name: 'Hydrogen Production Unit 2',
    owner: 'Company B',
    operator: 'Operator B',
    manufacturer: 'Manufacturer B',
    modelType: 'Model Y',
    modelNumber: 'MY-2025-002',
    serialNumber: 'SN002',
    mastrNumber: 'MASTR002',
    certifiedBy: 'Certification Body B',
    commissionedOn: '2025-02-01',
    address: {
      street: 'Secondary Street',
      postalCode: '23456',
      city: 'Hamburg',
      state: 'Niedersachsen',
      country: 'Germany',
    },
    method: HydrogenProductionMethod.ELECTROLYSIS,
    technology: HydrogenProductionTechnology.AEL,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: 2000,
    pressure: 40,
    waterConsumption: 3,
  },
];
