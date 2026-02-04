/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionType } from '@prisma/client';
import {
  PowerProductionUniRefDeepDbType,
  PowerProductionUnitDbType,
  PowerProductionUnitShallowDbType,
  PowerProductionUnitSurfaceDbType,
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

  static fromSurfaceDatabase(unit: PowerProductionUnitSurfaceDbType): PowerProductionUnitEntity {
    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromSurfaceBaseUnit(unit.generalInfo),
      modelType: unit.generalInfo?.modelType,
      unitType: UnitType.HYDROGEN_STORAGE,
      decommissioningPlannedOn: unit.decommissioningPlannedOn,
      electricityMeterNumber: unit.electricityMeterNumber,
      ratedPower: unit.ratedPower.toNumber(),
      gridOperator: unit.gridOperator,
      gridLevel: unit.gridLevel,
      biddingZone: unit.biddingZone,
      gridConnectionNumber: unit.gridConnectionNumber,
      financialSupportReceived: unit.financialSupportReceived,
      type: unit.type as PowerProductionType,
    };
  }

  static fromShallowDatabase(unit: PowerProductionUnitShallowDbType): PowerProductionUnitEntity {
    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromShallowBaseUnit(unit.generalInfo),
      modelType: unit.generalInfo?.modelType,
      address: unit.generalInfo.address,
      unitType: UnitType.HYDROGEN_STORAGE,
      decommissioningPlannedOn: unit.decommissioningPlannedOn,
      electricityMeterNumber: unit.electricityMeterNumber,
      ratedPower: unit.ratedPower.toNumber(),
      gridOperator: unit.gridOperator,
      gridLevel: unit.gridLevel,
      biddingZone: unit.biddingZone,
      gridConnectionNumber: unit.gridConnectionNumber,
      financialSupportReceived: unit.financialSupportReceived,
      type: unit.type as PowerProductionType,
    };
  }

  static fromDeepDatabase(unit: PowerProductionUniRefDeepDbType): PowerProductionUnitEntity {
    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromDeepBaseUnit(unit.generalInfo),
      modelType: unit.generalInfo?.modelType,
      address: unit.generalInfo.address,
      unitType: UnitType.HYDROGEN_STORAGE,
      decommissioningPlannedOn: unit.decommissioningPlannedOn,
      electricityMeterNumber: unit.electricityMeterNumber,
      ratedPower: unit.ratedPower.toNumber(),
      gridOperator: unit.gridOperator,
      gridLevel: unit.gridLevel,
      biddingZone: unit.biddingZone,
      gridConnectionNumber: unit.gridConnectionNumber,
      financialSupportReceived: unit.financialSupportReceived,
      type: unit.type as PowerProductionType,
    };
  }

  //TODO-LG: Replace with a deep, shallow or surface function if possible
  static override fromDatabase(unit: PowerProductionUnitDbType): PowerProductionUnitEntity {
    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
      ...PowerProductionUnitEntity.mapPowerProductionUnitSpecials(unit),
      unitType: UnitType.POWER_PRODUCTION,
    };
  }

  //TODO-LG: Replace with a deep, shallow or surface function if possible
  static mapPowerProductionUnitSpecials(unit: PowerProductionUnitDbType) {
    return {
      decommissioningPlannedOn: unit.powerProductionUnit?.decommissioningPlannedOn,
      electricityMeterNumber: unit.powerProductionUnit?.electricityMeterNumber,
      ratedPower: unit.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
      gridOperator: unit.powerProductionUnit?.gridOperator,
      gridLevel: unit.powerProductionUnit?.gridLevel,
      biddingZone: unit.powerProductionUnit?.biddingZone,
      gridConnectionNumber: unit.powerProductionUnit?.gridConnectionNumber,
      financialSupportReceived: unit.powerProductionUnit?.financialSupportReceived,
      type: unit.powerProductionUnit?.type,
    };
  }
}
