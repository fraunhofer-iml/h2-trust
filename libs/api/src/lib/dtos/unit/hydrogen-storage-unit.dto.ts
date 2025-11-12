/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitEntity } from '@h2-trust/amqp';
import { EnumLabelMapper, UnitType } from '@h2-trust/domain';
import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';
import { FillingDto } from './filling.dto';

export class HydrogenStorageUnitDto extends BaseUnitDto {
  storageType: string;
  capacity: number;
  pressure: number;
  filling: FillingDto[];

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    address: AddressDto,
    company: {
      id: string;
      hydrogenApprovals: {
        powerAccessApprovalStatus: string;
        powerProducerId: string;
      }[];
    },
    capacity: number,
    filling: FillingDto[],
    pressure: number,
    storageType: string,
    unitType: UnitType,
    modelNumber: string,
    owner: string,
    operator: string,
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      company,
      modelNumber,
      owner,
      operator,
      unitType,
    );
    this.capacity = capacity;
    this.filling = filling;
    this.pressure = pressure;
    this.storageType = storageType;
  }

  static override fromEntity(unit: HydrogenStorageUnitEntity): HydrogenStorageUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      storageType: EnumLabelMapper.getHydrogenStorageType(unit.type!),
      capacity: unit.capacity!,
      pressure: unit.pressure!,
      filling:
        unit.filling?.map((filling) => ({
          id: '',
          color: filling.color,
          amount: filling.amount,
        })) ?? [],
    };
  }
}
