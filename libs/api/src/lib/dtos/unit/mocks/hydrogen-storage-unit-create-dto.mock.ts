/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitCreateDto } from '@h2-trust/api';

export const HydrogenStorageUnitCreateDtoMock = <HydrogenStorageUnitCreateDto[]>[
  {
    unitType: 'HYDROGEN_STORAGE',
    name: 'Storage Unit 1',
    owner: 'Company A',
    operator: 'Operator A',
    manufacturer: 'Manufacturer A',
    modelType: 'Type A',
    modelNumber: 'MODEL-001',
    serialNumber: 'SER-001',
    mastrNumber: 'MASTR-001',
    certifiedBy: 'Certification Body A',
    commissionedOn: '2025-01-01',
    address: {
      street: 'Main Street',
      postalCode: '12345',
      city: 'Berlin',
      state: 'Berlin',
      country: 'Germany',
    },
    storageType: 'COMPRESSED_GASEOUS_HYDROGEN',
    capacity: 1000,
    pressure: 350,
  },
  {
    unitType: 'HYDROGEN_STORAGE',
    name: 'Storage Unit 2',
    owner: 'Company B',
    operator: 'Operator B',
    manufacturer: 'Manufacturer B',
    modelType: 'Type B',
    modelNumber: 'MODEL-002',
    serialNumber: 'SER-002',
    mastrNumber: 'MASTR-002',
    certifiedBy: 'Certification Body B',
    commissionedOn: '2025-02-01',
    address: {
      street: 'Secondary Street',
      postalCode: '23456',
      city: 'Hamburg',
      state: 'Niedersachsen',
      country: 'Germany',
    },
    storageType: 'LIQUID_HYDROGEN',
    capacity: 2000,
    pressure: 700,
  },
];
