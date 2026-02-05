/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenStorageUnitDbType,
  HydrogenStorageUnitDeepDbType,
  HydrogenStorageUnitFlatDbType,
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

  static fromDeepDatabase(unit: HydrogenStorageUnitDeepDbType): HydrogenStorageUnitEntity {
    return {
      ...BaseUnitEntity.fromDeepBaseUnit(unit.generalInfo),
      capacity: unit.capacity.toNumber(),
      pressure: unit.pressure.toNumber(),
      modelType: unit.generalInfo?.modelType,
      filling: HydrogenStorageUnitEntity.mapFillingForDeepAndNested(unit),
      address: unit.generalInfo.address,
      unitType: UnitType.HYDROGEN_STORAGE,
      type: unit.type as HydrogenStorageType,
    };
  }

  static fromNestedDatabase(unit: HydrogenStorageUnitNestedDbType): HydrogenStorageUnitEntity {
    return {
      ...BaseUnitEntity.fromNestedBaseUnit(unit.generalInfo),
      capacity: unit.capacity.toNumber(),
      pressure: unit.pressure.toNumber(),
      modelType: unit.generalInfo?.modelType,
      filling: HydrogenStorageUnitEntity.mapFillingForDeepAndNested(unit),
      address: unit.generalInfo.address,
      unitType: UnitType.HYDROGEN_STORAGE,
      type: unit.type as HydrogenStorageType,
    };
  }

  static fromFlatDatabase(unit: HydrogenStorageUnitFlatDbType): HydrogenStorageUnitEntity {
    return <HydrogenStorageUnitEntity>{
      ...BaseUnitEntity.fromFlatBaseUnit(unit.generalInfo),
      capacity: unit.capacity.toNumber(),
      pressure: unit.pressure.toNumber(),
      modelType: unit.generalInfo?.modelType,
      filling: [],
      address: unit.generalInfo.address,
      unitType: UnitType.HYDROGEN_STORAGE,
      type: unit.type as HydrogenStorageType,
    };
  }

  //TODO-LG: Replace with a deep, nested or flat function if possible
  static override fromDatabase(unit: HydrogenStorageUnitDbType): HydrogenStorageUnitEntity {
    return <HydrogenStorageUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
      capacity: unit.hydrogenStorageUnit?.capacity ?? 0,
      pressure: unit.hydrogenStorageUnit?.pressure ?? 0,
      type: unit.hydrogenStorageUnit?.type,
      filling: HydrogenStorageUnitEntity.mapFilling(unit),
      unitType: UnitType.HYDROGEN_STORAGE,
    };
  }

  private static mapFillingForDeepAndNested(
    unit: HydrogenStorageUnitDeepDbType | HydrogenStorageUnitNestedDbType,
  ): HydrogenComponentEntity[] {
    return (
      unit?.filling?.map((batch) => {
        if (!batch.batchDetails?.qualityDetails?.color) {
          throw new Error(`Hydrogen batch [${batch.id}] in storage unit is missing color information.`);
        }
        return {
          color: batch.batchDetails.qualityDetails.color,
          amount: batch.amount?.toNumber() ?? 0,
        };
      }) ?? []
    );
  }

  //TODO-LG: Replace with a deep, nested or flat function if possible
  private static mapFilling(unit: HydrogenStorageUnitDbType): HydrogenComponentEntity[] {
    return (
      unit.hydrogenStorageUnit?.filling?.map((batch) => {
        if (!batch.batchDetails?.qualityDetails?.color) {
          throw new Error(`Hydrogen batch [${batch.id}] in storage unit is missing color information.`);
        }
        return {
          color: batch.batchDetails.qualityDetails.color,
          amount: batch.amount?.toNumber() ?? 0,
        };
      }) ?? []
    );
  }
}
