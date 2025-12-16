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

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
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
    commissionedOn: string,
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
    return CreateHydrogenProductionUnitPayload.of(
      dto.name,
      dto.mastrNumber,
      new Date(dto.commissionedOn),
      AddressPayload.of(dto.address.street, dto.address.postalCode, dto.address.city, dto.address.state, dto.address.country),
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
