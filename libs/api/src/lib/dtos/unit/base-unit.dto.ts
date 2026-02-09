/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitEntity } from '@h2-trust/amqp';
import { UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { UnitOwnerDto } from './unit-owner.dto';

export abstract class BaseUnitDto {
  id: string;
  name: string;
  mastrNumber: string;
  manufacturer: string;
  modelType: string;
  modelNumber: string;
  serialNumber: string;
  certifiedBy: string;
  commissionedOn: Date;
  address: AddressDto;
  owner: UnitOwnerDto;
  operator: string;
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
    modelNumber: string,
    owner: UnitOwnerDto,
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
    this.owner = owner;
    this.operator = operator;
    this.unitType = unitType;
  }

  static fromEntity(unit: BaseUnitEntity): BaseUnitDto {
    return {
      id: unit.id,
      name: unit.name,
      mastrNumber: unit.mastrNumber,
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
        hydrogenApprovals:
          unit.owner?.hydrogenApprovals?.map((approval) => ({
            powerAccessApprovalStatus: approval.status,
            powerProducerId: approval.powerProducer.id,
          })) ?? [],
      },
      operator: unit.operator?.name,
      unitType: unit.unitType,
    };
  }
}
