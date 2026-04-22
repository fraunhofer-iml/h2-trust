/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitDeepDbType, BaseUnitFlatDbType, BaseUnitNestedDbType } from '@h2-trust/database';
import { UnitType } from '@h2-trust/domain';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';

export abstract class BaseUnitEntity {
  id: string;
  name: string;
  mastrNumber: string;
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

  protected constructor(
    id: string,
    name: string,
    mastrNumber: string,
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
    this.active = active;
  }

  static fromDeepBaseUnit(unit: BaseUnitDeepDbType): BaseUnitEntity {
    return <BaseUnitEntity>{
      id: unit.id,
      name: unit.name,
      mastrNumber: unit.mastrNumber,
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
    };
  }

  static fromNestedBaseUnit(unit: BaseUnitNestedDbType): BaseUnitEntity {
    return <BaseUnitEntity>{
      id: unit.id,
      name: unit.name,
      mastrNumber: unit.mastrNumber,
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
    };
  }

  static fromFlatBaseUnit(unit: BaseUnitFlatDbType): BaseUnitEntity {
    return <BaseUnitEntity>{
      id: unit.id,
      name: unit.name,
      mastrNumber: unit.mastrNumber,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      modelNumber: unit.modelNumber,
      serialNumber: unit.serialNumber,
      certifiedBy: unit.certifiedBy,
      commissionedOn: unit.commissionedOn,
      address: AddressEntity.fromDatabase(unit.address),
      owner: CompanyEntity.fromBaseType(unit.owner),
      operator: CompanyEntity.fromBaseType(unit.operator),
      active: unit.active,
    };
  }

  protected static mapOwner(unit: BaseUnitDeepDbType) {
    return unit.owner
      ? {
          id: unit.ownerId,
          hydrogenAgreements: BaseUnitEntity.mapHydrogenAgreements(unit),
        }
      : undefined;
  }

  private static mapHydrogenAgreements(unit: BaseUnitDeepDbType) {
    return (
      unit.owner?.hydrogenAgreements?.map((agreement) => ({
        powerPurchaseAgreementStatus: agreement.status,
        powerProducerId: agreement.powerProducerId,
        powerProducerName: agreement.powerProducer.name,
      })) ?? []
    );
  }
}
