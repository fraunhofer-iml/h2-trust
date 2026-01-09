/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitEntity } from '@h2-trust/amqp';
import { UnitType } from '@h2-trust/domain';
import { requireDefined } from '@h2-trust/utils';
import { AddressDto } from '../address';
import { UnitOwnerDto } from './unit-owner.dto';

export abstract class BaseUnitDto {
  id: string;
  name: string;
  mastrNumber: string;
  manufacturer?: string;
  modelType?: string;
  modelNumber?: string;
  serialNumber?: string;
  certifiedBy?: string;
  commissionedOn: Date;
  address: AddressDto;
  owner: string;
  operator?: string;
  company: UnitOwnerDto;
  unitType: UnitType;

  protected constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    company: UnitOwnerDto,
    modelNumber: string,
    owner: string,
    operator: string,
    unitType: UnitType,
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.modelNumber = modelNumber;
    this.serialNumber = serialNumber;
    this.certifiedBy = certifiedBy;
    this.commissionedOn = commissionedOn;
    this.address = address;
    this.company = company;
    this.owner = owner;
    this.operator = operator;
    this.unitType = unitType;
  }

  static fromEntity(unit: BaseUnitEntity): BaseUnitDto {
    return {
      id: requireDefined(unit.id, 'id'),
      name: requireDefined(unit.name, 'name'),
      mastrNumber: requireDefined(unit.mastrNumber, 'mastrNumber'),
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      modelNumber: unit.modelNumber,
      serialNumber: unit.serialNumber,
      certifiedBy: unit.certifiedBy,
      commissionedOn: requireDefined(unit.commissionedOn, 'commissionedOn'),
      address: {
        street: requireDefined(unit.address?.street, 'street'),
        postalCode: requireDefined(unit.address?.postalCode, 'postalCode'),
        city: requireDefined(unit.address?.city, 'city'),
        state: requireDefined(unit.address?.state, 'state'),
        country: requireDefined(unit.address?.country, 'country'),
      },
      company: {
        id: requireDefined(unit.company?.id, 'company.id'),
        hydrogenApprovals:
          unit.company?.hydrogenApprovals?.map((approval) => ({
            powerAccessApprovalStatus: requireDefined(approval.powerAccessApprovalStatus, 'powerAccessApprovalStatus'),
            powerProducerId: requireDefined(approval.powerProducerId, 'powerProducerId'),
          })) ?? [],
      },
      owner: requireDefined(unit.company?.id, 'owner'),
      operator: unit.operator?.id,
      unitType: requireDefined(unit.unitType, 'unitType'),
    };
  }
}
