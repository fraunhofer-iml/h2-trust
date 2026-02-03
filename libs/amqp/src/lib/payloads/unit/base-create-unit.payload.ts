/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { AddressPayload } from '../common';

export abstract class BaseCreateUnitPayload {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mastrNumber: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  modelType: string;

  @IsString()
  @IsNotEmpty()
  modelNumber: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  certifiedBy: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  commissionedOn: Date;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => AddressPayload)
  address: AddressPayload;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  operatorId: string;

  protected constructor(
    name: string,
    mastrNumber: string,
    commissionedOn: Date,
    address: AddressPayload,
    ownerId: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    operatorId: string,
  ) {
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.commissionedOn = commissionedOn;
    this.address = address;
    this.ownerId = ownerId;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.modelNumber = modelNumber;
    this.serialNumber = serialNumber;
    this.certifiedBy = certifiedBy;
    this.operatorId = operatorId;
  }
}
