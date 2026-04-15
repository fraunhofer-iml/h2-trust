/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseUnitDeepDbType,
  BaseUnitNestedDbType,
  HydrogenStorageUnitDeepDbType,
  HydrogenStorageUnitNestedDbType,
} from '@h2-trust/database';
import { HydrogenColor, HydrogenStorageType, RfnboType, UnitType } from '@h2-trust/domain';
import { assertDefined, assertValidEnum } from '@h2-trust/utils';
import { AddressEntity } from '../address';
import { HydrogenComponentEntity } from '../bottling';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';

export class HydrogenStorageUnitEntity extends BaseUnitEntity {
  capacity: number;
  pressure: number;
  type: HydrogenStorageType;
  filling: HydrogenComponentEntity[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
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
    pressure: number,
    type: HydrogenStorageType,
    filling: HydrogenComponentEntity[],
    active: boolean,
  ) {
    super(
      id,
      name,
      mastrNumber,
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
    this.pressure = pressure;
    this.type = type;
    this.filling = filling;
  }

  static fromDeepDatabase(baseUnit: BaseUnitDeepDbType): HydrogenStorageUnitEntity {
    assertValidEnum(baseUnit.hydrogenStorageUnit?.type, HydrogenStorageType, 'HydrogenStorageType');

    return {
      ...BaseUnitEntity.fromDeepBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: baseUnit.hydrogenStorageUnit?.capacity.toNumber() ?? 0,
      pressure: baseUnit.hydrogenStorageUnit?.pressure.toNumber() ?? 0,
      filling: baseUnit.hydrogenStorageUnit ? HydrogenStorageUnitEntity.mapFilling(baseUnit.hydrogenStorageUnit) : [],
      type: baseUnit.hydrogenStorageUnit?.type,
    };
  }

  static fromNestedDatabase(baseUnit: BaseUnitNestedDbType): HydrogenStorageUnitEntity {
    assertValidEnum(baseUnit.hydrogenStorageUnit?.type, HydrogenStorageType, 'HydrogenStorageType');

    return {
      ...BaseUnitEntity.fromNestedBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: baseUnit.hydrogenStorageUnit?.capacity.toNumber() ?? 0,
      pressure: baseUnit.hydrogenStorageUnit?.pressure.toNumber() ?? 0,
      filling: baseUnit.hydrogenStorageUnit ? HydrogenStorageUnitEntity.mapFilling(baseUnit.hydrogenStorageUnit) : [],
      type: baseUnit.hydrogenStorageUnit?.type,
    };
  }

  static fromNestedHydrogenStorageUnit(
    nestedHydrogenStorageUnit: HydrogenStorageUnitNestedDbType,
  ): HydrogenStorageUnitEntity {
    assertValidEnum(nestedHydrogenStorageUnit.type, HydrogenStorageType, 'HydrogenStorageType');

    return {
      ...BaseUnitEntity.fromFlatBaseUnit(nestedHydrogenStorageUnit.generalInfo),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: nestedHydrogenStorageUnit.capacity.toNumber() ?? 0,
      pressure: nestedHydrogenStorageUnit.pressure.toNumber() ?? 0,
      filling: HydrogenStorageUnitEntity.mapFilling(nestedHydrogenStorageUnit),
      type: nestedHydrogenStorageUnit.type,
    };
  }

  private static mapFilling(
    unit: HydrogenStorageUnitDeepDbType | HydrogenStorageUnitNestedDbType,
  ): HydrogenComponentEntity[] {
    return (
      unit?.filling?.map((batch) => {
        assertDefined(
          batch.batchDetails?.qualityDetails?.color,
          `batch.batchDetails.qualityDetails.color for batch ${batch.id}`,
        );
        assertValidEnum(batch.batchDetails?.qualityDetails?.color, HydrogenColor, 'HydrogenColor');
        assertValidEnum(batch.batchDetails.qualityDetails.rfnboType, RfnboType, 'RfnboType');

        return new HydrogenComponentEntity(
          batch?.processStep?.id ?? null,
          batch.batchDetails.qualityDetails.color,
          batch.amount?.toNumber() ?? 0,
          batch.batchDetails.qualityDetails.rfnboType,
        );
      }) ?? []
    );
  }
}
