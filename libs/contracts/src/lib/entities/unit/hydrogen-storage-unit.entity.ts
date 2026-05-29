/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType, UnitNestedDbType } from '@h2-trust/database';
import { HydrogenStorageType, RfnboType, UnitType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';
import { AddressEntity } from '../address';
import { HydrogenComponentEntity } from '../bottling';
import { CompanyEntity } from '../company';
import { ProcessStepEntity } from '../process-step';
import { BaseUnitEntity } from './base-unit.entity';

export class HydrogenStorageUnitEntity extends BaseUnitEntity {
  capacity: number;
  type: HydrogenStorageType;
  filling: HydrogenComponentEntity[];

  constructor(
    id: string,
    name: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressEntity,
    owner: CompanyEntity,
    operator: CompanyEntity,
    unitType: UnitType,
    capacity: number,
    type: HydrogenStorageType,
    filling: HydrogenComponentEntity[],
    active: boolean,
  ) {
    super(
      id,
      name,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      owner,
      operator,
      unitType,
      active,
    );
    this.capacity = capacity;
    this.type = type;
    this.filling = filling;
  }

  static fromDeepDatabase(
    baseUnit: UnitDeepDbType,
    processStepsOfStorageUnit: ProcessStepEntity[],
  ): HydrogenStorageUnitEntity {
    assertValidEnum(baseUnit.specification?.storageType, HydrogenStorageType, 'HydrogenStorageType');

    return {
      ...BaseUnitEntity.fromDeepBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: baseUnit.specification?.capacity?.toNumber() ?? 0,
      filling: baseUnit.specification ? HydrogenStorageUnitEntity.mapFilling(processStepsOfStorageUnit) : [],
      type: baseUnit.specification?.storageType,
    };
  }

  static fromNestedDatabase(
    baseUnit: UnitNestedDbType,
    processStepsOfStorageUnit: ProcessStepEntity[],
  ): HydrogenStorageUnitEntity {
    assertValidEnum(baseUnit.specification?.storageType, HydrogenStorageType, 'HydrogenStorageType');

    return {
      ...BaseUnitEntity.fromNestedBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: baseUnit.specification?.capacity?.toNumber() ?? 0,
      filling: baseUnit.specification ? HydrogenStorageUnitEntity.mapFilling(processStepsOfStorageUnit) : [],
      type: baseUnit.specification?.storageType,
    };
  }

  static fromNestedHydrogenStorageUnit(
    storageUnit: UnitNestedDbType,
    processStepsOfStorageUnit: ProcessStepEntity[],
  ): HydrogenStorageUnitEntity {
    assertValidEnum(storageUnit.type, HydrogenStorageType, 'HydrogenStorageType');

    return {
      ...BaseUnitEntity.fromFlatBaseUnit(storageUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: storageUnit.specification?.capacity?.toNumber() ?? 0,
      filling: HydrogenStorageUnitEntity.mapFilling(processStepsOfStorageUnit),
      type: storageUnit.type,
    };
  }

  private static mapFilling(processSteps: ProcessStepEntity[]): HydrogenComponentEntity[] {
    return (
      processSteps.map((processStep) => {
        assertValidEnum(processStep?.batch?.qualityDetails?.rfnboType, RfnboType, 'RfnboType');

        return new HydrogenComponentEntity(
          processStep?.id ?? null,
          processStep?.batch?.amount ?? 0,
          processStep.batch?.qualityDetails?.rfnboType,
        );
      }) ?? []
    );
  }
}
