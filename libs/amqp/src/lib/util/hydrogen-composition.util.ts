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
    predecessorHydrogenComponents: HydrogenComponentEntity[],
    bottleAmount: number,
  ): HydrogenComponentEntity[] {
    const mergedHydrogenComponents = HydrogenCompositionUtil.mergeComponentsOfSameColor(predecessorHydrogenComponents);

    const totalPredecessorAmount = Util.sumAmounts(mergedHydrogenComponents);
    if (totalPredecessorAmount <= 0) {
      throw new BrokerException(`Total stored amount is not greater than 0`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return mergedHydrogenComponents.map(
      ({ color, amount }) => new HydrogenComponentEntity('', color, (bottleAmount * amount) / totalPredecessorAmount),
    );
  }

  private static mergeComponentsOfSameColor(hydrogenComponents: HydrogenComponentEntity[]): HydrogenComponentEntity[] {
    return hydrogenComponents.reduce<HydrogenComponentEntity[]>(HydrogenCompositionUtil.mergeSingleComponent, []);
  }

  private static mergeSingleComponent(
    combinedComponents: HydrogenComponentEntity[],
    componentToMerge: HydrogenComponentEntity,
  ): HydrogenComponentEntity[] {
    const matchingComponent = combinedComponents.find((c) => c.color === componentToMerge.color);

    if (matchingComponent) {
      const updatedComponent = new HydrogenComponentEntity(
        '',
        matchingComponent.color,
        matchingComponent.amount + componentToMerge.amount,
      );
      return combinedComponents.map((c) => (c.color === componentToMerge.color ? updatedComponent : c));
    }

    return [...combinedComponents, new HydrogenComponentEntity('', componentToMerge.color, componentToMerge.amount)];
  }
}
