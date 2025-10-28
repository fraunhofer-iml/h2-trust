/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { requireDefined } from 'libs/utils/src/lib/assertions';
import { HydrogenProductionUnitEntity } from '@h2-trust/amqp';
import { UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';

export class HydrogenProductionUnitDto extends BaseUnitDto {
  method: string;
  technology: string;
  biddingZone: string;
  ratedPower: number;
  pressure: number;
  waterConsumptionLitersPerHour: number;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    company: {
      id: string;
      hydrogenApprovals: {
        powerAccessApprovalStatus: string;
        powerProducerId: string;
      }[];
    },
    ratedPower: number,
    modelNumber: string,
    owner: string,
    operator: string,
    unitType: UnitType,
    biddingZone: string,
    pressure: number,
    method: string,
    technology: string,
    waterConsumptionLitersPerHour: number,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      company,
      modelNumber,
      owner,
      operator,
      unitType,
    );
    this.method = method;
    this.technology = technology;
    this.biddingZone = biddingZone;
    this.ratedPower = ratedPower;
    this.pressure = pressure;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
  }

  static override fromEntity(unit: HydrogenProductionUnitEntity): HydrogenProductionUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      method: requireDefined(unit.method, 'method'),
      technology: requireDefined(unit.technology, 'technology'),
      biddingZone: requireDefined(unit.biddingZone, 'biddingZone'),
      ratedPower: requireDefined(unit.ratedPower, 'ratedPower'),
      pressure: requireDefined(unit.pressure, 'pressure'),
      waterConsumptionLitersPerHour: requireDefined(
        unit.waterConsumptionLitersPerHour,
        'waterConsumptionLitersPerHour',
      ),
    };
  }
}
