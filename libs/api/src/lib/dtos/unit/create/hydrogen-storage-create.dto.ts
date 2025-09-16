/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsIn, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { HydrogenStorageType, UnitType } from '../../../enums';
import { AddressDto } from '../../address';
import { UnitCreateDto } from './unit-create.dto';

export class HydrogenStorageUnitCreateDto extends UnitCreateDto {
  @IsNotEmpty()
  @IsIn(Object.values(HydrogenStorageType))
  storageType: HydrogenStorageType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  pressure: number;

  constructor(
    type: UnitType,
    name: string,
    owner: string,
    operator: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    mastrNumber: string,
    certifiedBy: string,
    commissionedOn: string,
    address: AddressDto,
    storageType: HydrogenStorageType,
    capacity: number,
    pressure: number,
  ) {
    super(
      type,
      name,
      owner,
      operator,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      mastrNumber,
      certifiedBy,
      commissionedOn,
      address,
    );
    this.storageType = storageType;
    this.capacity = capacity;
    this.pressure = pressure;
  }
}
