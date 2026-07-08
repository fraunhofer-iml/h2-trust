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
import { UnitDetailsType } from './unit-details.type';

export class UnitDetailsEntity {
  //shared
  ratedPower?: number;
  biddingZone?: BiddingZone;
  type?: UnitDetailsType;

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
    assertDefined(unit.details, 'unit details');
    if (unit.type === UnitType.POWER_PRODUCTION) {
      assertValidEnum(unit.details.biddingZone, BiddingZone, 'BiddingZone');
    } else if (unit.type === UnitType.HYDROGEN_PRODUCTION) {
      assertValidEnum(unit.details.type, HydrogenProductionType, 'HydrogenProductionType');
      assertValidEnum(unit.details.technology, HydrogenProductionTechnology, 'HydrogenProductionTechnology');
      assertValidEnum(unit.details.biddingZone, BiddingZone, 'BiddingZone');
    } else if (unit.type === UnitType.HYDROGEN_STORAGE) {
      assertValidEnum(unit.details?.type, HydrogenStorageType, 'HydrogenStorageType');
    } else if (unit.type === UnitType.TRANSPORTATION) {
      assertValidEnum(unit.details?.type, TransportType, 'TransportType');
    }
  }

  static fromDatabase(unit: UnitDeepDbType | UnitNestedDbType): UnitDetailsEntity {
    this.assertValidUnit(unit);

    return <UnitDetailsEntity>{
      decommissioningPlannedOn: unit.details.decommissioningPlannedOn,
      ratedPower: unit.details.ratedPower?.toNumber() ?? 0,
      biddingZone: unit.details.biddingZone,
      financialSupportReceived: unit.details.financialSupportReceived,
      type: unit.details.type,
      technology: unit.details.technology,
      waterConsumptionLitersPerHour: unit.details?.waterConsumptionLitersPerHour?.toNumber(),
      capacity: unit.details?.capacity?.toNumber() ?? 0,
      filling: [],
      fuelType: unit.details.fuelType,
    };
  }

  static mapFilling(processSteps: ProcessStepEntity[]): HydrogenComponentEntity[] {
    return (
      processSteps.map((processStep) => {
        assertValidEnum(processStep?.batch?.details?.rfnboType, RfnboType, 'RfnboType');

        return new HydrogenComponentEntity(
          processStep?.id ?? null,
          processStep?.batch?.amount ?? 0,
          processStep.batch?.details?.rfnboType,
          processStep.executedBy.unitType,
        );
      }) ?? []
    );
  }
}
