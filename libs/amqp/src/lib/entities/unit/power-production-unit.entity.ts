/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitDbType } from '@h2-trust/database';
import { BiddingZone, GridLevel, UnitType } from '@h2-trust/domain';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';
import { PowerProductionTypeEntity } from './power-production-type.entity';

export class PowerProductionUnitEntity extends BaseUnitEntity {
  decommissioningPlannedOn?: Date;
  electricityMeterNumber?: string;
  ratedPower?: number;
  gridOperator?: string;
  gridLevel?: GridLevel;
  biddingZone?: BiddingZone;
  gridConnectionNumber?: string;
  financialSupportReceived?: boolean;
  type?: PowerProductionTypeEntity;

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
      company,
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
      gridLevel: unit.powerProductionUnit?.gridLevel,
      biddingZone: unit.powerProductionUnit?.biddingZone,
      gridConnectionNumber: unit.powerProductionUnit?.gridConnectionNumber,
      financialSupportReceived: unit.powerProductionUnit?.financialSupportReceived,
      type: unit.powerProductionUnit?.type,
    };
  }
}
