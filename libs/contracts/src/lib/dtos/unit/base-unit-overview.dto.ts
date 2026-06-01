/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitEntity } from '@h2-trust/contracts/entities';
import { UnitType } from '@h2-trust/domain';
import { CompanyBaseDto } from '../company';
import { UnitOwnerDto } from './unit-owner.dto';

export class BaseUnitOverviewDto {
  id: string;
  name: string;
  manufacturer: string;
  modelType: string;
  modelNumber: string;
  serialNumber: string;
  certifiedBy: string;
  commissionedOn: Date;
  ownerName: string;
  operator: CompanyBaseDto;
  unitType: UnitType;
  active: boolean;

  constructor(
    id: string,
    name: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: CompanyBaseDto,
    unitType: UnitType,
    active: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.modelNumber = modelNumber;
    this.serialNumber = serialNumber;
    this.certifiedBy = certifiedBy;
    this.commissionedOn = commissionedOn;
    this.ownerName = owner.name;
    this.operator = operator;
    this.unitType = unitType;
    this.active = active;
  }

  static fromEntity(unit: BaseUnitEntity): BaseUnitOverviewDto {
    return {
      id: unit.id,
      name: unit.name,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      modelNumber: unit.modelNumber,
      serialNumber: unit.serialNumber,
      certifiedBy: unit.certifiedBy,
      commissionedOn: unit.commissionedOn,
      ownerName: unit.owner?.name,
      operator: new CompanyBaseDto(unit.operator.id, unit.operator.name),
      unitType: unit.unitType,
      active: unit.active,
    };
  }
}
