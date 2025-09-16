/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseUnitDbType } from '@h2-trust/database';
import { AddressEntity } from '../address';

export abstract class BaseUnitEntity {
  id?: string;
  name?: string;
  mastrNumber?: string;
  manufacturer?: string;
  modelType?: string;
  serialNumber?: string;
  commissionedOn?: Date;
  address?: AddressEntity;
  company?: {
    id?: string;
    hydrogenApprovals: {
      powerAccessApprovalStatus: string;
      powerProducerId: string;
      powerProducerName: string;
    }[];
  } | null;

  protected constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    commissionedOn: Date,
    address: AddressEntity,
    company: {
      id: string;
      hydrogenApprovals: { powerAccessApprovalStatus: string; powerProducerId: string; powerProducerName: string }[];
    } | null,
  ) {
    this.id = id;
    this.name = name;
    this.mastrNumber = mastrNumber;
    this.manufacturer = manufacturer;
    this.modelType = modelType;
    this.serialNumber = serialNumber;
    this.commissionedOn = commissionedOn;
    this.address = address;
    this.company = company;
  }

  static fromDatabase(unit: BaseUnitDbType): BaseUnitEntity {
    return <BaseUnitEntity>{
      id: unit.id,
      name: unit.name,
      mastrNumber: unit.mastrNumber,
      manufacturer: unit.manufacturer,
      modelType: unit.modelType,
      serialNumber: unit.serialNumber,
      commissionedOn: unit.commissionedOn,
      address: AddressEntity.fromDatabase(unit.address),
      company: BaseUnitEntity.mapCompany(unit),
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
        powerAccessApprovalStatus: approval.powerAccessApprovalStatus,
        powerProducerId: approval.powerProducerId,
        powerProducerName: approval.powerProducer.name,
      })) ?? []
    );
  }
}
