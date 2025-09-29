/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitType } from '@h2-trust/api';
import { PowerProductionUnitDbType } from '@h2-trust/database';
import { AddressEntity } from '../address';
import { BaseUnitEntity } from './base-unit.entity';
import { PowerProductionTypeEntity } from './power-production-type.entity';

export class PowerProductionUnitEntity extends BaseUnitEntity {
  decommissioningPlannedOn?: Date;
  electricityMeterNumber?: string;
  ratedPower: number;
  gridOperator?: string;
  gridLevelName?: string;
  biddingZoneName?: string;
  gridConnectionNumber?: string;
  type?: PowerProductionTypeEntity;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    electricityMeterNumber: string,
    address: AddressEntity,
    company: {
      id: string;
      hydrogenApprovals: { powerAccessApprovalStatus: string; powerProducerId: string; powerProducerName: string }[];
    } | null,
    ratedPower: number,
    gridOperator: string,
    gridLevelName: string,
    biddingZoneName: string,
    gridConnectionNumber: string,
    type: PowerProductionTypeEntity,
  ) {
    super(id, name, mastrNumber, manufacturer, modelType, serialNumber, commissionedOn, address, company);

    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.electricityMeterNumber = electricityMeterNumber;
    this.ratedPower = ratedPower;
    this.gridOperator = gridOperator;
    this.gridLevelName = gridLevelName;
    this.biddingZoneName = biddingZoneName;
    this.gridConnectionNumber = gridConnectionNumber;
    this.type = type;
  }

  static override fromDatabase(unit: PowerProductionUnitDbType): PowerProductionUnitEntity {
    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromDatabase(unit),
      ...PowerProductionUnitEntity.mapPowerProductionUnitSpecials(unit),
      unitType: UnitType.POWER_PRODUCTION,
    };
  }

  static mapPowerProductionUnitSpecials(unit: PowerProductionUnitDbType) {
    return {
      decommissioningPlannedOn: unit.powerProductionUnit?.decommissioningPlannedOn,
      electricityMeterNumber: unit.powerProductionUnit?.electricityMeterNumber,
      ratedPower: unit.powerProductionUnit?.ratedPower?.toNumber() ?? 0,
      gridOperator: unit.powerProductionUnit?.gridOperator,
      gridLevelName: unit.powerProductionUnit?.gridLevelName,
      biddingZoneName: unit.powerProductionUnit?.biddingZoneName,
      gridConnectionNumber: unit.powerProductionUnit?.gridConnectionNumber,
      type: unit.powerProductionUnit?.type,
    };
  }
}
