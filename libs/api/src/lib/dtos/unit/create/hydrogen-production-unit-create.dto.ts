/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsPositive } from 'class-validator';
import { HydrogenProductionUnitEntity } from '@h2-trust/amqp';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { UnitCreateDto } from './unit-create.dto';

export class HydrogenProductionUnitCreateDto extends UnitCreateDto {
  @IsNotEmpty()
  @IsEnum(HydrogenProductionMethod)
  method: HydrogenProductionMethod;

  @IsNotEmpty()
  @IsEnum(HydrogenProductionTechnology)
  technology: HydrogenProductionTechnology;

  @IsNotEmpty()
  @IsEnum(BiddingZone)
  biddingZone: BiddingZone;

  @IsNotEmpty()
  @IsPositive()
  ratedPower: number;

  @IsNotEmpty()
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
    technology: HydrogenProductionTechnology,
    method: HydrogenProductionMethod,
    biddingZone: BiddingZone,
    ratedPower: number,
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
    this.method = method;
    this.technology = technology;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
  }

  static toEntity(dto: HydrogenProductionUnitCreateDto): HydrogenProductionUnitEntity {
    return {
      name: dto.name,
      mastrNumber: dto.mastrNumber,
      manufacturer: dto.manufacturer,
      modelType: dto.modelType,
      modelNumber: dto.modelNumber,
      serialNumber: dto.serialNumber,
      commissionedOn: new Date(dto.commissionedOn),
      address: dto.address,
      company: {
        id: dto.owner,
      },
      operator: {
        id: dto.operator,
      },
      method: dto.method,
      technology: dto.technology,
      biddingZone: dto.biddingZone,
      ratedPower: dto.ratedPower,
      pressure: dto.pressure,
    };
  }
}
