/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType, UnitNestedDbType } from '@h2-trust/database';
import {
  BiddingZone,
  FuelType,
  HydrogenProductionTechnology,
  HydrogenProductionType,
  HydrogenStorageType,
  PowerProductionType,
  RfnboType,
  TransportType,
  UnitType,
} from '@h2-trust/domain';
import { assertDefined, assertValidEnum } from '@h2-trust/utils';
import { HydrogenComponentEntity } from '../bottling';
import { ProcessStepEntity } from '../process-step';
import { UnitSpecificationType } from './unit-specification.type';

export class UnitSpecificationEntity {
  //shared
  ratedPower?: number;
  biddingZone?: BiddingZone;
  type?: UnitSpecificationType;

  //power production
  decommissioningPlannedOn?: Date;
  financialSupportReceived?: boolean;

  //hydrogen production
  technology?: HydrogenProductionTechnology;
  waterConsumptionLitersPerHour?: number;

  //hydrogen storage
  capacity?: number;
  filling?: HydrogenComponentEntity[];

  //hydrogen transport
  fuelType?: FuelType;

  constructor(
    ratedPower: number,
    biddingZone: BiddingZone,
    type: PowerProductionType,
    decommissioningPlannedOn: Date,
    financialSupportReceived: boolean,
    technology: HydrogenProductionTechnology,
    waterConsumptionLitersPerHour: number,
    capacity: number,
    filling: HydrogenComponentEntity[],
    fuelType: FuelType,
  ) {
    this.ratedPower = ratedPower;
    this.biddingZone = biddingZone;
    this.type = type;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.financialSupportReceived = financialSupportReceived;
    this.technology = technology;
    this.waterConsumptionLitersPerHour = waterConsumptionLitersPerHour;
    this.capacity = capacity;
    this.filling = filling;
    this.fuelType = fuelType;
  }

  static assertValidUnit(unit: UnitDeepDbType | UnitNestedDbType) {
    assertDefined(unit.specification, 'unit specification');
    if (unit.type === UnitType.POWER_PRODUCTION) {
      assertValidEnum(unit.specification.biddingZone, BiddingZone, 'BiddingZone');
    } else if (unit.type === UnitType.HYDROGEN_PRODUCTION) {
      assertValidEnum(unit.specification.type, HydrogenProductionType, 'HydrogenProductionType');
      assertValidEnum(unit.specification.technology, HydrogenProductionTechnology, 'HydrogenProductionTechnology');
      assertValidEnum(unit.specification.biddingZone, BiddingZone, 'BiddingZone');
    } else if (unit.type === UnitType.HYDROGEN_STORAGE) {
      assertValidEnum(unit.specification?.type, HydrogenStorageType, 'HydrogenStorageType');
    } else if (unit.type === UnitType.TRANSPORTATION) {
      assertValidEnum(unit.specification?.type, TransportType, 'TransportType');
    }
  }

  static fromDatabase(unit: UnitDeepDbType | UnitNestedDbType): UnitSpecificationEntity {
    this.assertValidUnit(unit);

    return <UnitSpecificationEntity>{
      decommissioningPlannedOn: unit.specification.decommissioningPlannedOn,
      ratedPower: unit.specification.ratedPower?.toNumber() ?? 0,
      biddingZone: unit.specification.biddingZone,
      financialSupportReceived: unit.specification.financialSupportReceived,
      type: unit.specification.type,
      technology: unit.specification.technology,
      waterConsumptionLitersPerHour: unit.specification?.waterConsumptionLitersPerHour?.toNumber(),
      capacity: unit.specification?.capacity?.toNumber() ?? 0,
      filling: [],
      fuelType: unit.specification.fuelType,
    };
  }

  static mapFilling(processSteps: ProcessStepEntity[]): HydrogenComponentEntity[] {
    return (
      processSteps.map((processStep) => {
        assertValidEnum(processStep?.batch?.qualityDetails?.rfnboType, RfnboType, 'RfnboType');

        return new HydrogenComponentEntity(
          processStep?.id ?? null,
          processStep?.batch?.amount ?? 0,
          processStep.batch?.qualityDetails?.rfnboType,
        );
      }) ?? []
    );
  }
}
