/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { Type } from 'class-transformer';

export abstract class UnitCreateDto {
  @IsNotEmpty()
  @IsEnum(UnitType)
  unitType: UnitType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsOptional()
  @IsString()
  operator?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  modelType?: string;

  @IsOptional()
  @IsString()
  modelNumber?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsNotEmpty()
  @IsString()
  mastrNumber: string;

  @IsOptional()
  @IsString()
  certifiedBy?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  commissionedOn: Date;

  @IsNotEmpty()
  @Type(() => AddressDto)
  address: AddressDto;

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
  ) {
    this.unitType = type;
    this.name = name;
    this.owner = owner;
    this.operator = operator;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.modelNumber = modelNumber;
    this.serialNumber = serialNumber;
    this.mastrNumber = mastrNumber;
    this.certifiedBy = certifiedBy;
    this.commissionedOn = commissionedOn;
    this.address = address;
  }
}
