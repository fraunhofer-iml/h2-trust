/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseUnitDeepDbType,
  BaseUnitFlatDbType,
  BaseUnitNestedDbType,
  HydrogenStorageUnitDeepDbType,
  HydrogenStorageUnitNestedDbType,
} from '@h2-trust/database';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
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
    );
    this.capacity = capacity;
    this.pressure = pressure;
    this.type = type;
    this.filling = filling;
  }

  //TODO-LG: combine the fromDatabase functions
  static fromDeepDatabase(baseUnit: BaseUnitDeepDbType): HydrogenStorageUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a HydrogenStorageUnitEntity Object

    return {
      ...BaseUnitEntity.fromDeepBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: baseUnit.hydrogenStorageUnit?.capacity.toNumber() ?? 0,
      pressure: baseUnit.hydrogenStorageUnit?.pressure.toNumber() ?? 0,
      filling: baseUnit.hydrogenStorageUnit ? HydrogenStorageUnitEntity.mapFilling(baseUnit.hydrogenStorageUnit) : [],
      type: baseUnit.hydrogenStorageUnit?.type as HydrogenStorageType,
    };
  }

  static fromNestedDatabase(baseUnit: BaseUnitNestedDbType): HydrogenStorageUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a HydrogenStorageUnitEntity Object

    return {
      ...BaseUnitEntity.fromNestedBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: baseUnit.hydrogenStorageUnit?.capacity.toNumber() ?? 0,
      pressure: baseUnit.hydrogenStorageUnit?.pressure.toNumber() ?? 0,
      filling: baseUnit.hydrogenStorageUnit ? HydrogenStorageUnitEntity.mapFilling(baseUnit.hydrogenStorageUnit) : [],
      type: baseUnit.hydrogenStorageUnit?.type as HydrogenStorageType,
    };
  }

  static fromNestedHydrogenStorageUnit(
    nestedHydrogenStorageUnit: HydrogenStorageUnitNestedDbType,
  ): HydrogenStorageUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a HydrogenStorageUnitEntity Object

    return {
      ...BaseUnitEntity.fromFlatBaseUnit(nestedHydrogenStorageUnit.generalInfo),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: nestedHydrogenStorageUnit.capacity.toNumber() ?? 0,
      pressure: nestedHydrogenStorageUnit.pressure.toNumber() ?? 0,
      filling: HydrogenStorageUnitEntity.mapFilling(nestedHydrogenStorageUnit),
      type: nestedHydrogenStorageUnit.type as HydrogenStorageType,
    };
  }

  static fromFlatDatabase(baseUnit: BaseUnitFlatDbType): HydrogenStorageUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a HydrogenStorageUnitEntity Object

    return <HydrogenStorageUnitEntity>{
      ...BaseUnitEntity.fromFlatBaseUnit(baseUnit),
      unitType: UnitType.HYDROGEN_STORAGE,

      capacity: baseUnit.hydrogenStorageUnit?.capacity.toNumber() ?? 0,
      pressure: baseUnit.hydrogenStorageUnit?.pressure.toNumber() ?? 0,
      filling: [],
      type: (baseUnit.hydrogenStorageUnit?.type ?? HydrogenStorageType.LIQUID_HYDROGEN) as HydrogenStorageType,
    };
  }

  private static mapFilling(
    unit: HydrogenStorageUnitDeepDbType | HydrogenStorageUnitNestedDbType,
  ): HydrogenComponentEntity[] {
    return (
      unit?.filling?.map((batch) => {
        if (!batch.batchDetails?.qualityDetails?.color) {
          throw new Error(`Hydrogen batch [${batch.id}] in storage unit is missing color information.`);
        }
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
