/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { Batch } from '@prisma/client';
import { parseColor } from '@h2-trust/api';
import { HydrogenStorageUnitDbType } from '@h2-trust/database';
import { UnitType } from '@h2-trust/domain';
import { BrokerException } from '../../broker';
import { AddressEntity } from '../address';
import { HydrogenComponentEntity } from '../bottling';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';

export class HydrogenStorageUnitEntity extends BaseUnitEntity {
  capacity?: number;
  pressure?: number;
  type?: string;
  filling?: HydrogenComponentEntity[];

  constructor(
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
    capacity: number,
    pressure: number,
    type: string,
    filling: HydrogenComponentEntity[],
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      certifiedBy,
      commissionedOn,
      address,
      company,
      operator,
      unitType,
    );
    this.capacity = capacity;
    this.pressure = pressure;
    this.type = type;
    this.filling = filling;
  }

  static override fromDatabase(unit: HydrogenStorageUnitDbType): HydrogenStorageUnitEntity {
    return <HydrogenStorageUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
      capacity: unit.hydrogenStorageUnit?.capacity ?? 0,
      pressure: unit.hydrogenStorageUnit?.pressure ?? 0,
      type: unit.hydrogenStorageUnit?.type,
      filling: HydrogenStorageUnitEntity.mapFilling(unit),
      unitType: UnitType.HYDROGEN_STORAGE,
    };
  }

  private static mapFilling(unit: HydrogenStorageUnitDbType): HydrogenComponentEntity[] {
    return (
      unit.hydrogenStorageUnit?.filling?.map((batch: Batch) => {
        return {
          color: this.getColor(batch.quality),
          amount: batch.amount?.toNumber() ?? 0,
        };
      }) ?? []
    );
  }

  private static getColor(quality: string) {
    const parsedColor = parseColor(quality);
    if (!parsedColor) {
      throw new BrokerException(`Invalid quality: ${quality}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return parsedColor;
  }
}
