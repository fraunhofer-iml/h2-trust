/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity, HydrogenStorageUnitEntity } from '@h2-trust/amqp';
import { HydrogenStorageType } from '@h2-trust/domain';
import { HydrogenComponentDto } from '../digital-product-passport';

export class HydrogenStorageOverviewDto {
  id: string;
  name: string;
  capacity: number;
  filling: number;
  storageType: HydrogenStorageType;
  hydrogenComposition: HydrogenComponentDto[];

  constructor(
    id: string,
    name: string,
    capacity: number,
    filling: number,
    storageType: HydrogenStorageType,
    hydrogenComposition: HydrogenComponentDto[],
  ) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
    this.filling = filling;
    this.storageType = storageType;
    this.hydrogenComposition = hydrogenComposition;
  }

  static fromEntity(unit: HydrogenStorageUnitEntity): HydrogenStorageOverviewDto {
    return <HydrogenStorageOverviewDto>{
      id: unit.id,
      name: unit.name,
      capacity: unit.capacity,
      storageType: unit.type,
      filling: HydrogenStorageOverviewDto.addUpFillingAmounts(unit),
      hydrogenComposition: HydrogenStorageOverviewDto.mapHydrogenComposition(unit),
    };
  }

  private static addUpFillingAmounts(unit: HydrogenStorageUnitEntity): number {
    return (
      unit.filling?.reduce((sum, filling) => {
        if (filling.amount == null) {
          throw new Error('One or more filling amounts are undefined');
        }
        return sum + filling.amount;
      }, 0) ?? 0
    );
  }

  /**
   * Merges the fillings of a HydrogenStorageUnit with the same RFNBO Type.
   * @param unit The unit whose fillings are to be merged.
   * @returns A list of fillings in which no RFNBO type occurs twice and in which the amounts of the fillings with the same RFNBO type have been added together.
   */
  private static mapHydrogenComposition(unit: HydrogenStorageUnitEntity): HydrogenComponentDto[] {
    const compositionMap = new Map<string, number>();
    unit.filling?.forEach((filling: HydrogenComponentEntity) => {
      if (filling.rfnboType == null || filling.amount == null) {
        throw new Error('One or more fillings contain undefined values.');
      }
      compositionMap.set(filling.rfnboType, (compositionMap.get(filling.rfnboType) ?? 0) + filling.amount);
    });
    return Array.from(compositionMap, ([rfnboType, amount]) => ({
      processId: '',
      rfnboType: rfnboType,
      color: '',
      amount: amount,
    }));
  }
}
