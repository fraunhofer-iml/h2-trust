/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity, UnitEntity } from '@h2-trust/contracts/entities';
import { HydrogenStorageType, RfnboType, UnitType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';
import { HydrogenComponentDto } from '../digital-product-passport';

export class HydrogenStorageOverviewDto {
  id: string;
  name: string;
  unitType: UnitType;
  capacity: number;
  filling: number;
  storageType: HydrogenStorageType;
  hydrogenComposition: HydrogenComponentDto[];
  active: boolean;

  constructor(
    id: string,
    name: string,
    unitType: UnitType,
    capacity: number,
    filling: number,
    storageType: HydrogenStorageType,
    hydrogenComposition: HydrogenComponentDto[],
    active: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.unitType = unitType;
    this.capacity = capacity;
    this.filling = filling;
    this.storageType = storageType;
    this.hydrogenComposition = hydrogenComposition;
    this.active = active;
  }

  //TODO-LG: the process steps of the hydrogen storage unit are missing here
  //they have to be readded to calculate the filling of the storage
  static fromEntity(unit: UnitEntity): HydrogenStorageOverviewDto {
    assertValidEnum(unit.specification.type, HydrogenStorageType, 'HydrogenStorageType');
    return <HydrogenStorageOverviewDto>{
      id: unit.id,
      name: unit.name,
      unitType: UnitType.HYDROGEN_STORAGE,
      capacity: unit.specification.capacity,
      storageType: unit.specification.type,
      filling: HydrogenStorageOverviewDto.addUpFillingAmounts(unit),
      hydrogenComposition: HydrogenStorageOverviewDto.mapHydrogenComposition(unit),
      active: unit.active,
    };
  }

  private static addUpFillingAmounts(unit: UnitEntity): number {
    return unit.specification.filling?.reduce((sum, filling) => sum + filling.amount, 0) ?? 0;
  }

  /**
   * Merges the fillings of a HydrogenStorageUnit with the same RFNBO Type.
   * @param unit The unit whose fillings are to be merged.
   * @returns A list of fillings in which no RFNBO type occurs twice and in which the amounts of the fillings with the same RFNBO type have been added together.
   */
  private static mapHydrogenComposition(unit: UnitEntity): HydrogenComponentDto[] {
    const compositionMap = new Map<RfnboType, number>();

    unit.specification?.filling?.forEach((filling: HydrogenComponentEntity) => {
      compositionMap.set(filling.rfnboType, (compositionMap.get(filling.rfnboType) ?? 0) + filling.amount);
    });

    return Array.from(compositionMap, ([rfnboType, amount]) => new HydrogenComponentDto(null, amount, rfnboType));
  }
}
