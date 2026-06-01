/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType, UnitNestedDbType } from '@h2-trust/database';
import { FuelType, TransportType, UnitType } from '@h2-trust/domain';
import { assertDefined } from '@h2-trust/utils';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';

export class TransportUnitEntity extends BaseUnitEntity {
  type: TransportType;
  fuelType: FuelType;

  constructor(
    id: string,
    name: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressEntity,
    owner: CompanyEntity,
    operator: CompanyEntity,
    unitType: UnitType,
    type: TransportType,
    fuelType: FuelType,
    active: boolean,
  ) {
    super(
      id,
      name,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      owner,
      operator,
      unitType,
      active,
    );
    this.type = type;
    this.fuelType = fuelType;
  }

  static fromDeepUnitDatabase(unit: UnitDeepDbType): TransportUnitEntity {
    assertDefined(unit.specification, 'transportUnit');

    return <TransportUnitEntity>{
      ...BaseUnitEntity.fromDeepBaseUnit(unit),
      unitType: UnitType.TRANSPORTATION,
      type: unit.specification.type,
      fuelType: unit.specification.fuelType,
    };
  }

  static fromNestedUnitDatabase(unit: UnitNestedDbType): TransportUnitEntity {
    assertDefined(unit.specification, 'transportUnit');

    return <TransportUnitEntity>{
      ...BaseUnitEntity.fromNestedBaseUnit(unit),
      unitType: UnitType.TRANSPORTATION,
      type: unit.specification.type,
      fuelType: unit.specification.fuelType,
    };
  }
}
