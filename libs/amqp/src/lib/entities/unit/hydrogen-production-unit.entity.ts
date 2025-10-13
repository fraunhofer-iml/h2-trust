/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitType } from '@h2-trust/api';
import { HydrogenProductionUnitDbType } from '@h2-trust/database';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';
import { HydrogenProductionTypeEntity } from './hydrogen-production-type.entity';

export class HydrogenProductionUnitEntity extends BaseUnitEntity {
  ratedPower?: number;
  pressure?: number;
  type?: HydrogenProductionTypeEntity;
  biddingZoneName?: string;
  hydrogenStorageUnit?: {
    id?: string;
    name?: string;
  };

  constructor(
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
    ratedPower: number,
    pressure: number,
    type: HydrogenProductionTypeEntity,
    biddingZoneName: string,
    hydrogenStorageUnit: {
      id?: string;
      name?: string;
    },
  ) {
    super(
      id,
      name,
      mastrNumber,
      manufacturer,
      modelType,
      modelNumber,
      serialNumber,
      commissionedOn,
      address,
      company,
      operator,
      unitType,
    );
    this.ratedPower = ratedPower;
    this.pressure = pressure;
    this.type = type;
    this.biddingZoneName = biddingZoneName;
    this.hydrogenStorageUnit = hydrogenStorageUnit;
  }

  static override fromDatabase(unit: HydrogenProductionUnitDbType): HydrogenProductionUnitEntity {
    return <HydrogenProductionUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
      ratedPower: unit.hydrogenProductionUnit?.ratedPower?.toNumber() ?? 0,
      pressure: unit.hydrogenProductionUnit?.pressure?.toNumber() ?? 0,
      type: unit.hydrogenProductionUnit?.type
        ? HydrogenProductionTypeEntity.fromDatabase(unit.hydrogenProductionUnit.type)
        : undefined,
      biddingZoneName: unit.hydrogenProductionUnit?.biddingZoneName,
      hydrogenStorageUnit: HydrogenProductionUnitEntity.mapHydrogenStorageUnit(unit),
      unitType: UnitType.HYDROGEN_PRODUCTION,
    };
  }

  private static mapHydrogenStorageUnit(unit: HydrogenProductionUnitDbType) {
    return unit.hydrogenProductionUnit?.hydrogenStorageUnit
      ? {
          id: unit.hydrogenProductionUnit.hydrogenStorageUnit.id,
          name: unit.hydrogenProductionUnit.hydrogenStorageUnit.generalInfo?.name,
        }
      : undefined;
  }
}
