/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType, UnitNestedDbType } from '@h2-trust/database';
import { UnitType } from '@h2-trust/domain';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { UnitSpecificationEntity } from './unit-specification.entity';

export class UnitEntity {
  id: string;
  name: string;
  manufacturer: string;
  modelType: string;
  modelNumber: string;
  serialNumber: string;
  certifiedBy: string;
  commissionedOn: Date;
  address: AddressEntity;
  owner: CompanyEntity;
  operator: CompanyEntity;
  unitType: UnitType;
  active: boolean;
  specification: UnitSpecificationEntity;

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
    active: boolean,
    specification: UnitSpecificationEntity,
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
    this.unitType = unitType;
    this.active = active;
    this.specification = specification;
  }

  static fromDeepBaseUnit(unit: UnitDeepDbType): UnitEntity {
    return <UnitEntity>{
      id: unit.id,
      name: unit.name,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      modelNumber: unit.modelNumber,
      serialNumber: unit.serialNumber,
      certifiedBy: unit.certifiedBy,
      commissionedOn: unit.commissionedOn,
      address: AddressEntity.fromDatabase(unit.address),
      owner: CompanyEntity.fromNestedDatabase(unit.owner),
      operator: CompanyEntity.fromNestedDatabase(unit.operator),
      active: unit.active,
      unitType: unit.type,
      specification: UnitSpecificationEntity.fromDatabase(unit),
    };
  }

  static fromNestedBaseUnit(unit: UnitNestedDbType): UnitEntity {
    return <UnitEntity>{
      id: unit.id,
      name: unit.name,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      modelNumber: unit.modelNumber,
      serialNumber: unit.serialNumber,
      certifiedBy: unit.certifiedBy,
      commissionedOn: unit.commissionedOn,
      address: AddressEntity.fromDatabase(unit.address),
      owner: CompanyEntity.fromFlatDatabase(unit.owner),
      operator: CompanyEntity.fromFlatDatabase(unit.operator),
      active: unit.active,
      unitType: unit.type,
      specification: UnitSpecificationEntity.fromDatabase(unit),
    };
  }

  protected static mapOwner(unit: UnitDeepDbType) {
    return unit.owner
      ? {
          id: unit.ownerId,
          hydrogenAgreements: UnitEntity.mapHydrogenAgreements(unit),
        }
      : undefined;
  }

  private static mapHydrogenAgreements(unit: UnitDeepDbType) {
    return (
      unit.owner?.hydrogenAgreements?.map((agreement) => ({
        powerPurchaseAgreementStatus: agreement.status,
        powerProducerId: agreement.requestedCompanyId,
        powerProducerName: agreement.requestedCompany.name,
      })) ?? []
    );
  }
}
