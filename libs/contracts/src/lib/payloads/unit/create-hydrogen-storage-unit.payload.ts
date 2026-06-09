/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { HydrogenStorageType } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreateHydrogenStorageUnitPayload extends BaseCreateUnitPayload {
  @IsEnum(HydrogenStorageType)
  @IsNotEmpty()
  type: HydrogenStorageType;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  capacity: number;

  constructor(
    name: string,
    commissionedOn: Date,
    address: AddressPayload,
    ownerId: string,
    storageType: HydrogenStorageType,
    capacity: number,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    operatorId: string,
    id?: string,
  ) {
    super(
      name,
      commissionedOn,
      address,
      ownerId,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      operatorId,
      id,
    );
    this.type = storageType;
    this.capacity = capacity;
  }
}
