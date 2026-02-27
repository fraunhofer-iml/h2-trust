/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BrokerException } from '../broker/broker-exception';
import { HydrogenComponentEntity } from '../entities';
import { Util } from './util';

export class HydrogenCompositionUtil {
  static computeHydrogenComposition(
    hydrogenComponents: HydrogenComponentEntity[],
    bottleAmount: number,
  ): HydrogenComponentEntity[] {
    const mergedHydrogenComponents = hydrogenComponents.reduce<HydrogenComponentEntity[]>(HydrogenCompositionUtil.mergeSingleComponent, []);

    const totalAmount = Util.sumAmounts(mergedHydrogenComponents);
    if (totalAmount <= 0) {
      throw new BrokerException(`Total stored amount is not greater than 0`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return mergedHydrogenComponents.map(
      ({ processId, color, amount, rfnboType }) =>
        new HydrogenComponentEntity(processId, color, (bottleAmount * amount) / totalAmount, rfnboType),
    );
  }

  private static mergeSingleComponent(
    combinedComponents: HydrogenComponentEntity[],
    componentToMerge: HydrogenComponentEntity,
  ): HydrogenComponentEntity[] {
    const matchingComponent = combinedComponents.find((c) => c.rfnboType === componentToMerge.rfnboType);

    if (matchingComponent) {
      const updatedComponent = new HydrogenComponentEntity(
        '',
        matchingComponent.color,
        matchingComponent.amount + componentToMerge.amount,
        matchingComponent.rfnboType,
      );
      return combinedComponents.map((c) => (c.rfnboType === componentToMerge.rfnboType ? updatedComponent : c));
    }

    return [
      ...combinedComponents,
      new HydrogenComponentEntity('', componentToMerge.color, componentToMerge.amount, componentToMerge.rfnboType),
    ];
  }
}
