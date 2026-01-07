/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { HydrogenStorageType } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreateHydrogenStorageUnitPayload extends BaseCreateUnitPayload {
  @IsEnum(HydrogenStorageType)
  storageType: HydrogenStorageType; // TODO-MP: rename to type

  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsNumber()
  @IsPositive()
  pressure: number;

  constructor(
    name: string,
    mastrNumber: string,
    commissionedOn: Date,
    address: AddressPayload,
    companyId: string,
    storageType: HydrogenStorageType,
    capacity: number,
    pressure: number,
    manufacturer?: string,
    modelType?: string,
    modelNumber?: string,
    serialNumber?: string,
    certifiedBy?: string,
    operatorId?: string,
  ) {
    super(name, mastrNumber, commissionedOn, address, companyId, manufacturer, modelType, modelNumber, serialNumber, certifiedBy, operatorId);
    this.storageType = storageType;
    this.capacity = capacity;
    this.pressure = pressure;
  }
}
