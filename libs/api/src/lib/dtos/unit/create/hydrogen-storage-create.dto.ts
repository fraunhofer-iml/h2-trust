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
  @IsNotEmpty()
  @IsEnum(HydrogenStorageType)
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
    return CreateHydrogenStorageUnitPayload.of(
      dto.name,
      dto.mastrNumber,
      dto.commissionedOn,
      AddressPayload.of(
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
