/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitSeed, UnitSeed } from 'libs/database/src/seed';
import { HydrogenColor, HydrogenStorageType, RFNBOType, UnitType } from '@h2-trust/domain';
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
    UnitSeed[0].certifiedBy!,
    new Date(UnitSeed[0].commissionedOn),
    AddressEntityPowerMock,
    CompanyEntityHydrogenMock,
    CompanyEntityHydrogenMock,
    UnitType.HYDROGEN_STORAGE,
    HydrogenStorageUnitSeed[0].capacity.toNumber(),
    HydrogenStorageUnitSeed[0].pressure.toNumber(),
    HydrogenStorageUnitSeed[0].type as HydrogenStorageType,
    [new HydrogenComponentEntity('', HydrogenColor.GREEN, 100, RFNBOType.RFNBO_READY)],
  ),
];
