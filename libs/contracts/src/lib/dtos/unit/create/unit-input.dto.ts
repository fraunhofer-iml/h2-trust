/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { AddressPayload, BaseCreateUnitPayload } from '@h2-trust/contracts/payloads';
import { UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';

export class UnitInputDto {
  @IsEnum(UnitType)
  @IsNotEmpty()
  unitType: UnitType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsNotEmpty()
  operator: string;

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

  @IsNotEmpty()
  @ValidateNested()
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
    this.certifiedBy = certifiedBy;
    this.commissionedOn = commissionedOn;
    this.address = address;
  }

  static toBasePayload(dto: UnitInputDto, id?: string, requesterCompanyId?: string): BaseCreateUnitPayload {
    const payload = new BaseCreateUnitPayload(
      dto.name,
      dto.commissionedOn,
      new AddressPayload(
        dto.address.street,
        dto.address.postalCode,
        dto.address.city,
        dto.address.state,
        dto.address.country,
      ),
      dto.owner,
      dto.manufacturer,
      dto.modelType,
      dto.modelNumber,
      dto.serialNumber,
      dto.certifiedBy,
      dto.operator,
      id,
    );
    payload.requesterCompanyId = requesterCompanyId;
    return payload;
  }
}
