/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseUnitDeepDbType,
  BaseUnitFlatDbType,
  BaseUnitNestedDbType,
  PowerProductionUnitNestedDbType,
} from '@h2-trust/database';
import { BiddingZone, GridLevel, UnitType } from '@h2-trust/domain';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';
import { PowerProductionTypeEntity } from './power-production-type.entity';

export class PowerProductionUnitEntity extends BaseUnitEntity {
  decommissioningPlannedOn: Date;
  electricityMeterNumber: string;
  ratedPower: number;
  gridOperator: string;
  gridLevel: GridLevel;
  biddingZone: BiddingZone;
  gridConnectionNumber: string;
  financialSupportReceived: boolean;
  type: PowerProductionTypeEntity;

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
    owner: CompanyEntity,
    operator: CompanyEntity,
    unitType: UnitType,
    decommissioningPlannedOn: Date,
    electricityMeterNumber: string,
    ratedPower: number,
    gridOperator: string,
    gridLevel: GridLevel,
    biddingZone: BiddingZone,
    gridConnectionNumber: string,
    financialSupportReceived: boolean,
    type: PowerProductionTypeEntity,
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
      owner,
      operator,
      unitType,
    );
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.electricityMeterNumber = electricityMeterNumber;
    this.ratedPower = ratedPower;
    this.gridOperator = gridOperator;
    this.gridLevel = gridLevel;
    this.biddingZone = biddingZone;
    this.gridConnectionNumber = gridConnectionNumber;
    this.financialSupportReceived = financialSupportReceived;
    this.type = type;
  }

  //TODO-LG: combine the fromDatabase functions
  static fromDeepDatabase(baseUnit: BaseUnitDeepDbType): PowerProductionUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a powerProductionUnit Object

    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromDeepBaseUnit(baseUnit),
      unitType: UnitType.POWER_PRODUCTION,

      decommissioningPlannedOn: baseUnit.powerProductionUnit?.decommissioningPlannedOn,
      electricityMeterNumber: baseUnit.powerProductionUnit?.electricityMeterNumber,
      ratedPower: baseUnit.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
      gridOperator: baseUnit.powerProductionUnit?.gridOperator,
      gridLevel: baseUnit.powerProductionUnit?.gridLevel,
      biddingZone: baseUnit.powerProductionUnit?.biddingZone,
      gridConnectionNumber: baseUnit.powerProductionUnit?.gridConnectionNumber,
      financialSupportReceived: baseUnit.powerProductionUnit?.financialSupportReceived,
      type: baseUnit.powerProductionUnit?.type,
    };
  }

  static fromNestedDatabase(baseUnit: BaseUnitNestedDbType): PowerProductionUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a powerProductionUnit Object

    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromNestedBaseUnit(baseUnit),
      unitType: UnitType.POWER_PRODUCTION,

      decommissioningPlannedOn: baseUnit.powerProductionUnit?.decommissioningPlannedOn,
      electricityMeterNumber: baseUnit.powerProductionUnit?.electricityMeterNumber,
      ratedPower: baseUnit.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
      gridOperator: baseUnit.powerProductionUnit?.gridOperator,
      gridLevel: baseUnit.powerProductionUnit?.gridLevel,
      biddingZone: baseUnit.powerProductionUnit?.biddingZone,
      gridConnectionNumber: baseUnit.powerProductionUnit?.gridConnectionNumber,
      financialSupportReceived: baseUnit.powerProductionUnit?.financialSupportReceived,
      type: baseUnit.powerProductionUnit?.type,
    };
  }

  static fromNestedPowerProductionUnit(
    powerProductionUnit: PowerProductionUnitNestedDbType,
  ): PowerProductionUnitEntity {
    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromFlatBaseUnit(powerProductionUnit.generalInfo),
      unitType: UnitType.POWER_PRODUCTION,

      decommissioningPlannedOn: powerProductionUnit.generalInfo.powerProductionUnit?.decommissioningPlannedOn,
      electricityMeterNumber: powerProductionUnit.generalInfo.powerProductionUnit?.electricityMeterNumber,
      ratedPower: powerProductionUnit.generalInfo.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
      gridOperator: powerProductionUnit.generalInfo.powerProductionUnit?.gridOperator,
      gridLevel: powerProductionUnit.generalInfo.powerProductionUnit?.gridLevel,
      biddingZone: powerProductionUnit.generalInfo.powerProductionUnit?.biddingZone,
      gridConnectionNumber: powerProductionUnit.generalInfo.powerProductionUnit?.gridConnectionNumber,
      financialSupportReceived: powerProductionUnit.generalInfo.powerProductionUnit?.financialSupportReceived,
      type: powerProductionUnit.generalInfo.powerProductionUnit?.type,
    };
  }

  static fromFlatDatabase(baseUnit: BaseUnitFlatDbType): PowerProductionUnitEntity {
    //TODO-LG: add assertion that the given baseUnit has a powerProductionUnit Object

    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromFlatBaseUnit(baseUnit),
      unitType: UnitType.POWER_PRODUCTION,

      decommissioningPlannedOn: baseUnit.powerProductionUnit?.decommissioningPlannedOn,
      electricityMeterNumber: baseUnit.powerProductionUnit?.electricityMeterNumber,
      ratedPower: baseUnit.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
      gridOperator: baseUnit.powerProductionUnit?.gridOperator,
      gridLevel: baseUnit.powerProductionUnit?.gridLevel,
      biddingZone: baseUnit.powerProductionUnit?.biddingZone,
      gridConnectionNumber: baseUnit.powerProductionUnit?.gridConnectionNumber,
      financialSupportReceived: baseUnit.powerProductionUnit?.financialSupportReceived,
      type: baseUnit.powerProductionUnit?.type,
    };
  }
}
