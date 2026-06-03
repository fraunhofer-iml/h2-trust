/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty } from 'class-validator';
import { FuelType, TransportType } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreateHydrogenTransportUnitPayload extends BaseCreateUnitPayload {
  @IsEnum(TransportType)
  @IsNotEmpty()
  transportType: TransportType;

  @IsEnum(FuelType)
  @IsNotEmpty()
  fuelType: FuelType;

  constructor(
    name: string,
    commissionedOn: Date,
    address: AddressPayload,
    ownerId: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    operatorId: string,
    transportType: TransportType,
    fuelType: FuelType,
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
    this.transportType = transportType;
    this.fuelType = fuelType;
  }
}
