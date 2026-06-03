/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { FillingDto } from './filling.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class HydrogenStorageUnitDto extends BaseUnitDto {
  storageType: HydrogenStorageType;
  capacity: number;
  filling: FillingDto[];

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
    unitType: UnitType,
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
      unitType,
      active,
    );
    this.capacity = capacity;
    this.filling = filling;
    this.storageType = storageType;
  }

  static override fromEntity(unit: UnitEntity): HydrogenStorageUnitDto {
    assertValidEnum(unit.specification.type, HydrogenStorageType, 'HydrogenStorageType');

    return {
      ...BaseUnitDto.fromEntity(unit),
      storageType: unit.specification.type,
      capacity: unit.specification.capacity ?? 0,
      filling:
        unit.specification.filling?.map((filling) => ({
          id: '',
          amount: filling.amount,
        })) ?? [],
    };
  }
}
