/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AddressPayload } from '../common';

export abstract class BaseCreateUnitPayload {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mastrNumber: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  modelType?: string;

  @IsString()
  @IsOptional()
  modelNumber?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  certifiedBy?: string;

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
  companyId: string; // TODO-MP: should be ownerId

  @IsString()
  @IsOptional()
  operatorId?: string;

  protected constructor(
    name: string,
    mastrNumber: string,
    commissionedOn: Date,
    address: AddressPayload,
    companyId: string,
    manufacturer?: string,
    modelType?: string,
    modelNumber?: string,
    serialNumber?: string,
    certifiedBy?: string,
    operatorId?: string,
  ) {
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.commissionedOn = commissionedOn;
    this.address = address;
    this.companyId = companyId;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.modelNumber = modelNumber;
    this.serialNumber = serialNumber;
    this.certifiedBy = certifiedBy;
    this.operatorId = operatorId;
  }
}
