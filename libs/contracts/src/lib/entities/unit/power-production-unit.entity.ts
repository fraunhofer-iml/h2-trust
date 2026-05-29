/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitDeepDbType, UnitNestedDbType } from '@h2-trust/database';
import { BiddingZone, PowerProductionType, UnitType } from '@h2-trust/domain';
import { assertDefined, assertValidEnum } from '@h2-trust/utils';
import { AddressEntity } from '../address';
import { CompanyEntity } from '../company';
import { BaseUnitEntity } from './base-unit.entity';

export class PowerProductionUnitEntity extends BaseUnitEntity {
  decommissioningPlannedOn: Date;
  ratedPower: number;
  biddingZone: BiddingZone;
  financialSupportReceived: boolean;
  type: PowerProductionType;

  constructor(
    id: string,
    name: string,
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
    ratedPower: number,
    biddingZone: BiddingZone,
    financialSupportReceived: boolean,
    type: PowerProductionType,
    active: boolean,
  ) {
    super(
      id,
      name,
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
      active,
    );
    this.decommissioningPlannedOn = decommissioningPlannedOn;
    this.ratedPower = ratedPower;
    this.biddingZone = biddingZone;
    this.financialSupportReceived = financialSupportReceived;
    this.type = type;
  }

  static fromDeepUnitDatabase(baseUnit: UnitDeepDbType): PowerProductionUnitEntity {
    assertDefined(baseUnit.specification, 'powerProductionUnit');
    assertValidEnum(baseUnit.specification.biddingZone, BiddingZone, 'BiddingZone');

    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromDeepBaseUnit(baseUnit),
      unitType: UnitType.POWER_PRODUCTION,
      decommissioningPlannedOn: baseUnit.specification.decommissioningPlannedOn,
      ratedPower: baseUnit.specification.ratedPower?.toNumber() ?? 0,
      biddingZone: baseUnit.specification.biddingZone,
      financialSupportReceived: baseUnit.specification.financialSupportReceived,
      type: baseUnit.specification.type,
    };
  }

  static fromNestedUnitDatabase(unit: UnitNestedDbType): PowerProductionUnitEntity {
    assertDefined(unit.specification, 'powerProductionUnit');
    assertValidEnum(unit.specification.biddingZone, BiddingZone, 'BiddingZone');

    return <PowerProductionUnitEntity>{
      ...BaseUnitEntity.fromNestedBaseUnit(unit),
      unitType: UnitType.POWER_PRODUCTION,

      decommissioningPlannedOn: unit.specification.decommissioningPlannedOn,
      ratedPower: unit.specification.ratedPower?.toNumber() ?? 0,
      biddingZone: unit.specification.biddingZone,
      financialSupportReceived: unit.specification.financialSupportReceived,
      type: unit.specification.type,
    };
  }
}
