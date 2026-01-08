/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { AddressPayload, CreateHydrogenStorageUnitPayload } from '@h2-trust/amqp';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { UnitCreateDto } from './unit-create.dto';

export class HydrogenStorageUnitCreateDto extends UnitCreateDto {
  @IsEnum(HydrogenStorageType)
  @IsNotEmpty()
  storageType: HydrogenStorageType;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  capacity: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
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
    commissionedOn: Date,
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

  static toPayload(dto: HydrogenStorageUnitCreateDto): CreateHydrogenStorageUnitPayload {
    return new CreateHydrogenStorageUnitPayload(
      dto.name,
      dto.mastrNumber,
      dto.commissionedOn,
      new AddressPayload(
        dto.address.street,
        dto.address.postalCode,
        dto.address.city,
        dto.address.state,
        dto.address.country,
      ),
      dto.owner,
      dto.storageType,
      dto.capacity,
      dto.pressure,
      dto.manufacturer,
      dto.modelType,
      dto.modelNumber,
      dto.serialNumber,
      dto.certifiedBy,
      dto.operator,
    );
  }
}
