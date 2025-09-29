/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitType } from '../../enums';
import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';

export class HydrogenProductionUnitDto extends BaseUnitDto {
  ratedPower: number;
  typeName: string;
  biddingZoneName: string;
  pressure: number;
  method: string;
  technology: string;
  hydrogenStorageUnit: {
    id: string;
    name: string;
  };

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressDto,
    company: {
      id: string;
      hydrogenApprovals: {
        powerAccessApprovalStatus: string;
        powerProducerId: string;
      }[];
    },
    ratedPower: number,
    typeName: string,
    hydrogenStorageUnit: { id: string; name: string },
    modelNumber: string,
    owner: string,
    operator: string,
    unitType: UnitType,
    biddingZoneName: string,
    pressure: number,
    method: string,
    technology: string,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      serialNumber,
      commissionedOn,
      decommissioningPlannedOn,
      address,
      company,
      modelNumber,
      owner,
      operator,
      unitType,
    );
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
    this.biddingZoneName = biddingZoneName;
    this.pressure = pressure;
    this.method = method;
    this.technology = technology;
  }
}
