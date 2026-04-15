/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitEntity } from '@h2-trust/amqp';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { FillingDto } from './filling.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class HydrogenStorageUnitDto extends BaseUnitDto {
  storageType: HydrogenStorageType;
  capacity: number;
  pressure: number;
  filling: FillingDto[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    capacity: number,
    filling: FillingDto[],
    pressure: number,
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
      mastrNumber,
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
    this.pressure = pressure;
    this.storageType = storageType;
  }

  static override fromEntity(unit: HydrogenStorageUnitEntity): HydrogenStorageUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      storageType: unit.type,
      capacity: unit.capacity!,
      pressure: unit.pressure!,
      filling:
        unit.filling?.map((filling) => ({
          id: '',
          color: filling.color,
          amount: filling.amount,
        })) ?? [],
    };
  }
}
