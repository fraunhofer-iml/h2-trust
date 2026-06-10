/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { CompanyBaseDto } from '../company';
import { UnitOwnerDto } from './unit-owner.dto';

export abstract class BaseUnitDto {
  abstract readonly unitType: UnitType;

  id: string;
  name: string;
  manufacturer: string;
  modelType: string;
  modelNumber: string;
  serialNumber: string;
  certifiedBy: string;
  commissionedOn: Date;
  address: AddressDto;
  owner: UnitOwnerDto;
  operator: CompanyBaseDto;
  active: boolean;

  protected constructor(
    id: string,
    name: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    modelNumber: string,
    owner: UnitOwnerDto,
    operator: CompanyBaseDto,
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
    this.address = address;
    this.owner = owner;
    this.operator = operator;

    this.active = active;
  }

  static fromEntity(unit: UnitEntity): BaseUnitDto {
    return {
      id: unit.id,
      name: unit.name,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      modelNumber: unit.modelNumber,
      serialNumber: unit.serialNumber,
      certifiedBy: unit.certifiedBy,
      commissionedOn: unit.commissionedOn,
      address: {
        street: unit.address.street,
        postalCode: unit.address.postalCode,
        city: unit.address.city,
        state: unit.address.state,
        country: unit.address.country,
      },
      owner: {
        id: unit.owner?.id,
        name: unit.owner?.name,
        hydrogenAgreements:
          unit.owner?.hydrogenAgreements?.map((agreement) => ({
            powerPurchaseAgreementStatus: agreement.status,
            powerProducerId: agreement.requestedCompany.id,
          })) ?? [],
      },
      operator: new CompanyBaseDto(unit.operator.id, unit.operator.name),
      active: unit.active,
      unitType: unit.unitType,
    };
  }
}
