/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { HydrogenComponentEntity } from '..';
import { BrokerException } from '@h2-trust/messaging';

export class HydrogenCompositionUtil {
  /**
   * Merges a list of HydrogenComponents, so that all components are grouped together with the same RFNBO type.
   * Then sets the amount of each grouped HydrogenComponent to an amount value according to the requested bottleAmount.
   * @param hydrogenComponents The HydrogenComponents, that should be grouped.
   * @param bottleAmount The requested bottle Amount.
   * @returns The merged list of HydrogenComponents, where each RFNBO type only exists once.
   */
  static computeHydrogenComposition(
    hydrogenComponents: HydrogenComponentEntity[],
    bottleAmount: number,
  ): HydrogenComponentEntity[] {
    //The list of HydrogenComponents merged according to their RFNBO Type
    const mergedHydrogenComponents = hydrogenComponents.reduce<HydrogenComponentEntity[]>(
      HydrogenCompositionUtil.mergeSingleComponent,
      [],
    );

    const totalAmount = mergedHydrogenComponents.reduce((sum, item) => sum + item.amount, 0);
    if (totalAmount <= 0) {
      throw new BrokerException(`Total stored amount is not greater than 0`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return mergedHydrogenComponents.map(
      ({ processId, color, amount, rfnboType }) =>
        new HydrogenComponentEntity(processId, color, (bottleAmount * amount) / totalAmount, rfnboType),
    );
  }

  /**
   * Merges a new HydrogenComponent into a list of HydrogenComponents according to the RFNBO status.
   * @param combinedComponents The list of combined HydrogenComponents.
   * @param componentToMerge The new HydrogenComponent that should be added.
   * @returns The updated list including the new HydrogenComponent.
   */
  private static mergeSingleComponent(
    combinedComponents: HydrogenComponentEntity[],
    componentToMerge: HydrogenComponentEntity,
  ): HydrogenComponentEntity[] {
    const matchingComponent = combinedComponents.find((c) => c.rfnboType === componentToMerge.rfnboType);

    if (matchingComponent) {
      const updatedComponent = new HydrogenComponentEntity(
        null,
        matchingComponent.color,
        matchingComponent.amount + componentToMerge.amount,
        matchingComponent.rfnboType,
      );
      return combinedComponents.map((c) => (c.rfnboType === componentToMerge.rfnboType ? updatedComponent : c));
    }

    return [
      ...combinedComponents,
      new HydrogenComponentEntity(null, componentToMerge.color, componentToMerge.amount, componentToMerge.rfnboType),
    ];
  }
}
