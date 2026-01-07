/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { AddressPayload, CreateHydrogenProductionUnitPayload } from '@h2-trust/amqp';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { UnitCreateDto } from './unit-create.dto';

export class HydrogenProductionUnitCreateDto extends UnitCreateDto {
  @IsEnum(HydrogenProductionMethod)
  @IsNotEmpty()
  method: HydrogenProductionMethod;

  @IsEnum(HydrogenProductionTechnology)
  @IsNotEmpty()
  technology: HydrogenProductionTechnology;

  @IsEnum(BiddingZone)
  @IsNotEmpty()
  biddingZone: BiddingZone;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  ratedPower: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  pressure: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  waterConsumptionLitersPerHour: number;

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
    technology: HydrogenProductionTechnology,
    method: HydrogenProductionMethod,
    biddingZone: BiddingZone,
    ratedPower: number,
    pressure: number,
    waterConsumptionLitersPerHour: number,
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
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static toPayload(dto: HydrogenProductionUnitCreateDto): CreateHydrogenProductionUnitPayload {
    return new CreateHydrogenProductionUnitPayload(
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
      dto.method,
      dto.technology,
      dto.biddingZone,
      dto.ratedPower,
      dto.pressure,
      dto.waterConsumptionLitersPerHour,
      dto.manufacturer,
      dto.modelType,
      dto.modelNumber,
      dto.serialNumber,
      dto.certifiedBy,
      dto.operator,
    );
  }
}
