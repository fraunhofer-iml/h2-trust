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
import { FillingDto } from './filling.dto';

export class HydrogenStorageUnitDto extends BaseUnitDto {
  capacity: number;
  filling: FillingDto[];
  pressure: number;
  storageType: string;
  hydrogenProductionUnits: {
    id: string;
    name: string;
    hydrogenStorageUnitId: string;
  }[];

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
    capacity: number,
    filling: FillingDto[],
    pressure: number,
    storageType: string,
    hydrogenProductionUnits: {
      id: string;
      name: string;
      hydrogenStorageUnitId: string;
    }[],
    unitType: UnitType,
    modelNumber: string,
    owner: string,
    operator: string,
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
    this.capacity = capacity;
    this.filling = filling;
    this.hydrogenProductionUnits = hydrogenProductionUnits;
    this.pressure = pressure;
    this.storageType = storageType;
  }
}
