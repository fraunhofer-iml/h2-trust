/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology } from '@h2-trust/domain';
import { AddressPayload } from '../common';
import { BaseCreateUnitPayload } from './base-create-unit.payload';

export class CreateHydrogenProductionUnitPayload extends BaseCreateUnitPayload {
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
  ) {
    super(name, mastrNumber, commissionedOn, address, companyId, manufacturer, modelType, modelNumber, serialNumber, certifiedBy, operatorId);
    this.method = method;
    this.technology = technology;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }
}
