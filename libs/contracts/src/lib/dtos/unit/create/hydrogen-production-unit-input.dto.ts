/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { AddressPayload, CreateHydrogenProductionUnitPayload } from '@h2-trust/contracts/payloads';
import { BiddingZone, HydrogenProductionTechnology, HydrogenProductionType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { UnitInputDto } from './unit-input.dto';

export class HydrogenProductionUnitInputDto extends UnitInputDto {
  @IsEnum(HydrogenProductionType)
  @IsNotEmpty()
  method: HydrogenProductionType;

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
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    technology: HydrogenProductionTechnology,
    method: HydrogenProductionType,
    biddingZone: BiddingZone,
    ratedPower: number,
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
      certifiedBy,
      commissionedOn,
      address,
    );
    this.method = method;
    this.technology = technology;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static toPayload(
    dto: HydrogenProductionUnitInputDto,
    id?: string,
    requesterCompanyId?: string,
  ): CreateHydrogenProductionUnitPayload {
    const payload = new CreateHydrogenProductionUnitPayload(
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
      dto.method,
      dto.technology,
      dto.biddingZone,
      dto.ratedPower,
      dto.waterConsumptionLitersPerHour,
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
