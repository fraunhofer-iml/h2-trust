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
    };
  }

  //TODO-LG: Replace with a deep, nested or flat function if possible
  static fromDatabase(unit: BaseUnitDeepDbType): BaseUnitEntity {
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
    };
  }

  protected static mapOwner(unit: BaseUnitDeepDbType) {
    return unit.owner
      ? {
          id: unit.ownerId,
          hydrogenApprovals: BaseUnitEntity.mapHydrogenApprovals(unit),
        }
      : undefined;
  }

  private static mapHydrogenApprovals(unit: BaseUnitDeepDbType) {
    return (
      unit.owner?.hydrogenApprovals?.map((approval) => ({
        powerAccessApprovalStatus: approval.status,
        powerProducerId: approval.powerProducerId,
        powerProducerName: approval.powerProducer.name,
      })) ?? []
    );
  }
}
