/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenColorDbEnum } from 'libs/database/src/lib/enums/hydrogen-color.db.enum';
import { HydrogenStorageUnitSeed, UnitSeed } from 'libs/database/src/seed';
import { UnitType } from '@h2-trust/api';
import { AddressEntityPowerMock } from '../../address';
import { HydrogenComponentEntity } from '../../bottling';
import { CompanyEntityHydrogenMock } from '../../company';
import { HydrogenStorageUnitEntity } from '../hydrogen-storage-unit.entity';

export const HydrogenStorageUnitEntityMock: HydrogenStorageUnitEntity[] = [
  new HydrogenStorageUnitEntity(
    HydrogenStorageUnitSeed[0].id,
    UnitSeed[0].name,
    UnitSeed[0].mastrNumber,
    UnitSeed[0].manufacturer!,
    UnitSeed[0].modelType!,
    UnitSeed[0].modelNumber!,
    UnitSeed[0].serialNumber!,
    new Date(UnitSeed[0].commissionedOn),
    AddressEntityPowerMock,
    {
      id: CompanyEntityHydrogenMock.id!,
      hydrogenApprovals: [],
    },
    CompanyEntityHydrogenMock,
    UnitType.HYDROGEN_STORAGE,
    HydrogenStorageUnitSeed[0].capacity.toNumber(),
    HydrogenStorageUnitSeed[0].pressure.toNumber(),
    HydrogenStorageUnitSeed[0].typeName,
    [new HydrogenComponentEntity(HydrogenColorDbEnum.GREEN, 100)],
  ),
];
