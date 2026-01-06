/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreateHydrogenProductionUnitPayload extends BaseCreateUnitPayload {
  @IsEnum(HydrogenProductionMethod)
  method!: HydrogenProductionMethod;

  @IsEnum(HydrogenProductionTechnology)
  technology!: HydrogenProductionTechnology;

  @IsEnum(BiddingZone)
  biddingZone!: BiddingZone;

  @IsNumber()
  @IsPositive()
  ratedPower!: number;

  @IsNumber()
  @IsPositive()
  pressure!: number;

  @IsNumber()
  @IsPositive()
  waterConsumptionLitersPerHour!: number;

  static of(
    name: string,
    mastrNumber: string,
    commissionedOn: Date,
    address: AddressPayload,
    companyId: string,
    method: HydrogenProductionMethod,
    technology: HydrogenProductionTechnology,
    biddingZone: BiddingZone,
    ratedPower: number,
    pressure: number,
    waterConsumptionLitersPerHour: number,
    manufacturer?: string,
    modelType?: string,
    modelNumber?: string,
    serialNumber?: string,
    certifiedBy?: string,
    operatorId?: string,
  ): CreateHydrogenProductionUnitPayload {
    return {
      name,
      mastrNumber,
      commissionedOn,
      address,
      companyId,
      method,
      technology,
      biddingZone,
      ratedPower,
      pressure,
      waterConsumptionLitersPerHour,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      operatorId,
    };
  }
}
