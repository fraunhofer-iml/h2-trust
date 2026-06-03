/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { FuelType, TransportType, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { BaseUnitDto } from './base-unit.dto';
import { UnitOwnerDto } from './unit-owner.dto';

export class HydrogenTransportUnitDto extends BaseUnitDto {
  type: TransportType;
  fuelType: FuelType;

  constructor(
    id: string,
    name: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    unitType: UnitType,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: CompanyBaseDto,
    type: TransportType,
    fuelType: FuelType,
    active: boolean,
  ) {
    super(
      id,
      name,
      manufacturer,
      modelType,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      modelNumber,
      owner,
      operator,
      unitType,
      active,
    );
    this.type = type;
    this.fuelType = fuelType;
  }

  static override fromEntity(unit: UnitEntity): HydrogenTransportUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      type: unit.specification.type as TransportType,
      fuelType: unit.specification.fuelType as FuelType,
    };
  }
}
