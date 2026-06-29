/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitSpecificationType } from '@h2-trust/contracts/entities';
import { RfnboType, UnitType } from '@h2-trust/domain';
import { HydrogenComponentDto } from '../digital-product-passport';

export class ComponentsOverviewDto {
  id: string;
  name: string;
  unitType: UnitType;
  capacity: number;
  filling: number;
  hydrogenComposition: HydrogenComponentDto[];
  active: boolean;
  unitSpecType: UnitSpecificationType;

  constructor(
    id: string,
    name: string,
    unitType: UnitType,
    capacity: number,
    hydrogenComposition: HydrogenComponentDto[],
    active: boolean,
    unitSpecType: UnitSpecificationType,
  ) {
    this.id = id;
    this.name = name;
    this.unitType = unitType;
    this.capacity = capacity > 0 ? capacity : ComponentsOverviewDto.addUpFillingAmounts(hydrogenComposition);
    this.filling = ComponentsOverviewDto.addUpFillingAmounts(hydrogenComposition);
    this.hydrogenComposition = ComponentsOverviewDto.mapHydrogenComposition(hydrogenComposition);
    this.active = active;
    this.unitSpecType = unitSpecType;
  }

  private static addUpFillingAmounts(hydrogenComponents: HydrogenComponentDto[]): number {
    return hydrogenComponents?.reduce((sum, filling) => sum + filling.amount, 0) ?? 0;
  }

  /**
   * Merges the fillings of a HydrogenStorageUnit with the same RFNBO Type.
   * @param unit The unit whose fillings are to be merged.
   * @returns A list of fillings in which no RFNBO type occurs twice and in which the amounts of the fillings with the same RFNBO type have been added together.
   */
  private static mapHydrogenComposition(hydrogenComponents: HydrogenComponentDto[]): HydrogenComponentDto[] {
    const compositionMap = new Map<RfnboType, number>();

    hydrogenComponents?.forEach((filling: HydrogenComponentDto) => {
      compositionMap.set(filling.rfnboType, (compositionMap.get(filling.rfnboType) ?? 0) + filling.amount);
    });

    return Array.from(compositionMap, ([rfnboType, amount]) => new HydrogenComponentDto(null, amount, rfnboType));
  }
}
