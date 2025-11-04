/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Unit } from '@prisma/client';
import { AddressSeed } from '../address.seed';
import { CompanySeed } from '../company.seed';

export const UnitSeed = <Unit[]>[
  {
    id: 'power-production-unit-0',
    name: 'Photovoltaic System 001',
    mastrNumber: 'BG-1500-2025',
    manufacturer: 'AgriVolt Systems',
    modelType: 'EcoGen1500',
    modelNumber: 'EG1500-BIO',
    serialNumber: 'PPU-SN-0002',
    certifiedBy: 'TÜV NORD AG',
    commissionedOn: new Date('2023-06-15'),
    addressId: AddressSeed[0].id,
    ownerId: CompanySeed[0].id,
    operatorId: CompanySeed[0].id,
  },
  {
    id: 'power-production-unit-1',
    name: 'Wind Turbine 001',
    mastrNumber: 'SEE202300123456',
    manufacturer: 'Wind Energy GmbH',
    modelType: 'WE 4.5/75',
    modelNumber: 'WE-4.5/75-V5',
    serialNumber: 'WE4575-002561',
    certifiedBy: 'EnergieControl Zert GmbH',
    commissionedOn: new Date('2025-03-19'),
    addressId: AddressSeed[2].id,
    ownerId: CompanySeed[2].id,
    operatorId: CompanySeed[2].id,
  },
  {
    id: 'power-production-unit-2',
    name: 'Hydro Power Plant 001',
    mastrNumber: 'NUC-X1-2020',
    manufacturer: 'CoreNova Technologies',
    modelType: 'X1-Reactor',
    modelNumber: 'CN-X1-2020',
    serialNumber: 'PPU-SN-0003',
    certifiedBy: 'TÜV SÜD AG',
    commissionedOn: new Date('2020-09-01'),
    addressId: AddressSeed[4].id,
    ownerId: CompanySeed[2].id,
    operatorId: CompanySeed[2].id,
  },
  {
    id: 'power-production-unit-3',
    name: 'Grid Connection',
    mastrNumber: 'GRID-2025-01',
    manufacturer: CompanySeed[3].name,
    modelType: 'GridConnection',
    modelNumber: 'GRID-001',
    serialNumber: 'GRID-SN-0001',
    certifiedBy: 'TÜV Saarland e. V.',
    commissionedOn: new Date('2025-08-14'),
    addressId: AddressSeed[1].id,
    ownerId: CompanySeed[1].id,
    operatorId: CompanySeed[1].id,
  },
  {
    id: 'hydrogen-production-unit-0',
    name: 'Hydrogen Electrolyzer Dortmund 001',
    mastrNumber: 'SEE900000198765',
    manufacturer: 'HydroNova Technologies GmbH',
    modelType: 'HN-Elektrolyser Pro X',
    modelNumber: 'HN-EL-PX500',
    serialNumber: 'PX500-00034872',
    certifiedBy: 'EnergieControl Zert GmbH',
    commissionedOn: new Date('2025-03-15'),
    addressId: AddressSeed[5].id,
    ownerId: CompanySeed[2].id,
    operatorId: CompanySeed[2].id,
  },
  {
    id: 'hydrogen-storage-unit-0',
    name: 'Hydrogen Storage Dortmund 001',
    mastrNumber: 'SEE900000239841',
    manufacturer: 'HydroNova Technologies GmbH',
    modelType: 'HN-Storage X',
    modelNumber: 'HN-STO-X50',
    serialNumber: 'STO50-0000527',
    certifiedBy: 'EnergieControl Zert GmbH',
    commissionedOn: new Date('2025-03-18'),
    addressId: AddressSeed[5].id,
    ownerId: CompanySeed[2].id,
    operatorId: CompanySeed[2].id,
  },
];
