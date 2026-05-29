/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { AddressPayload, CreatePowerProductionUnitPayload } from '@h2-trust/contracts/payloads';
import { BiddingZone, PowerProductionType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../../address';
import { UnitInputDto } from './unit-input.dto';

export class PowerProductionUnitInputDto extends UnitInputDto {
  @IsEnum(PowerProductionType)
  @IsNotEmpty()
  powerProductionType: PowerProductionType;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  decommissioningPlannedOn: Date;

  @IsEnum(BiddingZone)
  @IsNotEmpty()
  biddingZone: BiddingZone;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  ratedPower: number;

  @IsBoolean()
  @IsNotEmpty()
  financialSupportReceived: boolean;

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
    powerProductionType: PowerProductionType,
    biddingZone: BiddingZone,
    ratedPower: number,
    financialSupportReceived: boolean,
    decommissioningPlannedOn: Date,
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
    this.powerProductionType = powerProductionType;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.financialSupportReceived = financialSupportReceived;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
  }

  static toPayload(
    dto: PowerProductionUnitInputDto,
    id?: string,
    requesterCompanyId?: string,
  ): CreatePowerProductionUnitPayload {
    const payload = new CreatePowerProductionUnitPayload(
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
      dto.ratedPower,
      dto.biddingZone,
      dto.financialSupportReceived,
      dto.powerProductionType,
      dto.manufacturer,
      dto.modelType,
      dto.modelNumber,
      dto.serialNumber,
      dto.certifiedBy,
      dto.operator,
      dto.decommissioningPlannedOn,
      id,
    );
    payload.requesterCompanyId = requesterCompanyId;
    return payload;
  }
}
