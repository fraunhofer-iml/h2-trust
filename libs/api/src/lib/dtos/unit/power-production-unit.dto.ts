/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitEntity } from '@h2-trust/amqp';
import { UnitType } from '@h2-trust/domain';
import { requireDefined } from '@h2-trust/utils';
import { EnumLabelMapper } from '../../labels';
import { AddressDto } from '../address';
import { BaseUnitDto } from './base-unit.dto';
import { PowerProductionTypeDto } from './power-production-type.dto';

export class PowerProductionUnitDto extends BaseUnitDto {
  electricityMeterNumber: string;
  gridOperator?: string;
  gridConnectionNumber?: string;
  gridLevel: string;
  biddingZone: string;
  ratedPower: number;
  decommissioningPlannedOn?: Date;
  type: PowerProductionTypeDto;
  financialSupportReceived: boolean;

  constructor(
    id: string,
    name: string,
    mastrNumber: string,
    manufacturer: string,
    modelType: string,
    serialNumber: string,
    certifiedBy: string,
    commissionedOn: Date,
    decommissioningPlannedOn: Date,
    address: AddressDto,
    company: {
      id: string;
      hydrogenApprovals: { powerAccessApprovalStatus: string; powerProducerId: string }[];
    },
    ratedPower: number,
    gridOperator: string,
    gridLevel: string,
    gridConnectionNumber: string,
    type: PowerProductionTypeDto,
    unitType: UnitType,
    modelNumber: string,
    owner: string,
    operator: string,
    electricityMeterNumber: string,
    biddingZone: string,
    financialSupportReceived: boolean,
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
    this.ratedPower = ratedPower;
    this.gridOperator = gridOperator;
    this.gridLevel = gridLevel;
    this.gridConnectionNumber = gridConnectionNumber;
    this.type = type;
    this.electricityMeterNumber = electricityMeterNumber;
    this.biddingZone = biddingZone;
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.financialSupportReceived = financialSupportReceived;
  }

  static override fromEntity(unit: PowerProductionUnitEntity): PowerProductionUnitDto {
    return {
      ...BaseUnitDto.fromEntity(unit),
      electricityMeterNumber: requireDefined(unit.electricityMeterNumber, 'electricityMeterNumber'),
      gridOperator: unit.gridOperator,
      gridConnectionNumber: unit.gridConnectionNumber,
      gridLevel: EnumLabelMapper.getGridLevel(requireDefined(unit.gridLevel, 'gridLevel')),
      biddingZone: requireDefined(unit.biddingZone, 'biddingZone'),
      ratedPower: requireDefined(unit.ratedPower, 'ratedPower'),
      decommissioningPlannedOn: unit.decommissioningPlannedOn,
      type: {
        name: EnumLabelMapper.getPowerProductionType(requireDefined(unit.type?.name, 'type.name')),
        energySource: requireDefined(unit.type?.energySource, 'type.energySource'),
        hydrogenColor: requireDefined(unit.type?.hydrogenColor, 'type.hydrogenColor'),
      },
      financialSupportReceived: requireDefined(unit.financialSupportReceived, 'financialSupportReceived'),
    };
  }
}
