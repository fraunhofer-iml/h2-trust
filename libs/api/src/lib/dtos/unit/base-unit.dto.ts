/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitEntity } from '@h2-trust/amqp';
import { requireDefined } from '@h2-trust/utils';
import { UnitType } from '../../enums';
import { AddressDto } from '../address';

export abstract class BaseUnitDto {
  id: string;
  name: string;
  mastrNumber: string;
  manufacturer: string;
  modelType: string;
  modelNumber: string;
  owner: string;
  operator: string;
  serialNumber: string;
  commissionedOn: Date;
  decommissioningPlannedOn?: Date;
  address: AddressDto;
  company: {
    id: string;
    hydrogenApprovals: {
      powerAccessApprovalStatus: string;
      powerProducerId: string;
    }[];
  };
  unitType: UnitType;

  protected constructor(
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
    this.serialNumber = serialNumber;
    this.commissionedOn = commissionedOn;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.address = address;
    this.company = company;
    this.unitType = unitType;
    this.modelNumber = modelNumber;
    this.owner = owner;
    this.operator = operator;
  }

  static fromEntity(unit: BaseUnitEntity): BaseUnitDto {
    return {
      id: requireDefined(unit.id, 'id'),
      name: requireDefined(unit.name, 'name'),
      mastrNumber: requireDefined(unit.mastrNumber, 'mastrNumber'),
      manufacturer: requireDefined(unit.manufacturer, 'manufacturer'),
      modelType: requireDefined(unit.modelType, 'modelType'),
      serialNumber: requireDefined(unit.serialNumber, 'serialNumber'),
      commissionedOn: requireDefined(unit.commissionedOn, 'commissionedOn'),
      decommissioningPlannedOn: undefined,
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
      modelNumber: requireDefined(unit.modelNumber, 'modelNumber'),
      owner: requireDefined(unit.company?.id, 'owner'),
      operator: requireDefined(unit.operator?.id, 'operator'),
      unitType: requireDefined(unit.unitType, 'unitType'),
    };
  }
}
