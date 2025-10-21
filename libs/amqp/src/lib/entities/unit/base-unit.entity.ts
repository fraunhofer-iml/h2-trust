/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitDbType } from '@h2-trust/database';
import { UnitType } from '@h2-trust/domain';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';

export abstract class BaseUnitEntity {
  id?: string;
  name?: string;
  mastrNumber?: string;
  manufacturer?: string;
  modelType?: string;
  modelNumber?: string;
  serialNumber?: string;
  commissionedOn?: Date;
  address?: AddressEntity;
  company?: {
    // TODO-MP: should be owner?
    id?: string;
    hydrogenApprovals?: {
      powerAccessApprovalStatus?: string;
      powerProducerId?: string;
      powerProducerName?: string;
    }[];
  } | null;
  operator?: CompanyEntity;
  unitType?: UnitType;

  protected constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    modelNumber: string,
    serialNumber: string,
    commissionedOn: Date,
    address: AddressEntity,
    company: {
      id?: string;
      hydrogenApprovals?: {
        powerAccessApprovalStatus?: string;
        powerProducerId?: string;
        powerProducerName?: string;
      }[];
    } | null,
    operator: CompanyEntity,
    unitType: UnitType,
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.modelNumber = modelNumber;
    this.serialNumber = serialNumber;
    this.commissionedOn = commissionedOn;
    this.address = address;
    this.company = company;
    this.operator = operator;
    this.unitType = unitType;
  }

  static fromDatabase(unit: BaseUnitDbType): BaseUnitEntity {
    return <BaseUnitEntity>{
      id: unit.id,
      name: unit.name,
      mastrNumber: unit.mastrNumber,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      modelNumber: unit.modelNumber,
      serialNumber: unit.serialNumber,
      commissionedOn: unit.commissionedOn,
      address: AddressEntity.fromDatabase(unit.address),
      company: BaseUnitEntity.mapCompany(unit),
      operator: unit.operator ? CompanyEntity.fromDatabase(unit.operator) : undefined,
    };
  }

  protected static mapCompany(unit: BaseUnitDbType) {
    return unit.owner
      ? {
          id: unit.ownerId,
          hydrogenApprovals: BaseUnitEntity.mapHydrogenApprovals(unit),
        }
      : undefined;
  }

  private static mapHydrogenApprovals(unit: BaseUnitDbType) {
    return (
      unit.owner?.hydrogenApprovals?.map((approval) => ({
        powerAccessApprovalStatus: approval.status,
        powerProducerId: approval.powerProducerId,
        powerProducerName: approval.powerProducer.name,
      })) ?? []
    );
  }
}
