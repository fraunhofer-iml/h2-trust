/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { FillingDto } from './filling.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class HydrogenStorageUnitDto extends BaseUnitDto {
  storageType: HydrogenStorageType;
  capacity: number;
  filling: FillingDto[];
  override readonly unitType = UnitType.HYDROGEN_STORAGE;

  constructor(
    id: string,
    name: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    capacity: number,
    filling: FillingDto[],
    storageType: HydrogenStorageType,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: CompanyBaseDto,
    active: boolean,
  ) {
    super(
      id,
      name,
      manufacturer,
      modelType,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      modelNumber,
      owner,
      operator,
      active,
    );
    this.capacity = capacity;
    this.filling = filling;
    this.storageType = storageType;
  }

  static override fromEntity(unit: UnitEntity): HydrogenStorageUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      unitType: UnitType.HYDROGEN_STORAGE,
      storageType: unit.details.type as HydrogenStorageType,
      capacity: unit.details.capacity ?? 0,
      filling:
        unit.details.filling?.map((filling) => ({
          id: '',
          amount: filling.amount,
        })) ?? [],
    };
  }
}
