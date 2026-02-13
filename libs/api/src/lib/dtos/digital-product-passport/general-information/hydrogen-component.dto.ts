/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/amqp';
import { RfnboBaseDto } from './rfnbo-compliance.dto';

export class HydrogenComponentDto {
  processId: string;
  rfnbo?: RfnboBaseDto;
  color: string;
  amount: number;

  constructor(processId: string, color: string, amount: number, rfnboReady?: RfnboBaseDto) {
    this.processId = processId;
    this.rfnbo = rfnboReady;
    this.color = color;
    this.amount = amount;
  }

  static fromEntity(hydrogenComponentEntity: HydrogenComponentEntity): HydrogenComponentDto {
    return <HydrogenComponentDto>{
      processId: hydrogenComponentEntity.processId,
      color: hydrogenComponentEntity.color,
      amount: hydrogenComponentEntity.amount,
    };
  }

  /**
   * Should be used to merge all HydrogenComponents with the same RFNBO Status.
   * @param hydrogenComponents The list of HydrogenComponents that should be merged.
   * @returns A list of HydrogenComponents, but no two elements have the same RFNBO value.
   */
  public static mergeComponents(hydrogenComponents: HydrogenComponentDto[]): HydrogenComponentDto[] {
    return hydrogenComponents.reduce<HydrogenComponentDto[]>(HydrogenComponentDto.mergeSingleComponent, []);
  }

  private static mergeSingleComponent(
    combinedComponents: HydrogenComponentDto[],
    componentToMerge: HydrogenComponentDto,
  ): HydrogenComponentDto[] {
    const matchingComponent = combinedComponents.find(
      (c) => c.rfnbo?.rfnboReady === componentToMerge.rfnbo?.rfnboReady,
    );

    if (matchingComponent) {
      const updatedComponent = new HydrogenComponentDto(
        '',
        matchingComponent.color,
        matchingComponent.amount + componentToMerge.amount,
        matchingComponent.rfnbo,
      );
      return combinedComponents.map((c) =>
        c.rfnbo?.rfnboReady === componentToMerge.rfnbo?.rfnboReady ? updatedComponent : c,
      );
    }

    return [
      ...combinedComponents,
      new HydrogenComponentDto('', componentToMerge.color, componentToMerge.amount, componentToMerge.rfnbo),
    ];
  }
}
