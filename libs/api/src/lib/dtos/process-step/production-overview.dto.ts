/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';

export class ProductionOverviewDto {
  startedAt: string;
  endedAt: string;
  productionUnit: string;
  producedAmount: number;
  color: string;
  powerProducer: string;
  powerConsumed: number;
  storageUnit: string;

  constructor(
    startedAt: string,
    endedAt: string,
    productionUnit: string,
    producedAmount: number,
    color: string,
    powerProducer: string,
    powerConsumed: number,
    storageUnit: string,
  ) {
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.productionUnit = productionUnit;
    this.producedAmount = producedAmount;
    this.color = color;
    this.powerProducer = powerProducer;
    this.powerConsumed = powerConsumed;
    this.storageUnit = storageUnit;
  }

  static fromEntity(processStep: ProcessStepEntity): ProductionOverviewDto {
    return <ProductionOverviewDto>{
      startedAt: processStep.startedAt.toString(),
      endedAt: processStep.endedAt.toString(),
      productionUnit: processStep.executedBy?.name,
      producedAmount: processStep.batch?.amount,
      color: processStep.batch?.qualityDetails?.color,
      powerProducer: processStep.batch?.predecessors?.[0]?.owner?.name,
      powerConsumed: ProductionOverviewDto.determinePowerConsumed(processStep),
      storageUnit: processStep.batch?.hydrogenStorageUnit?.name,
    };
  }

  private static determinePowerConsumed(processStep: ProcessStepEntity) {
    // NOTE: In the future, a batch could also have several predecessors
    if (processStep.batch?.predecessors?.[0]?.type !== BatchType.POWER) {
      return null;
    }
    return processStep.batch?.predecessors?.[0]?.amount;
  }
}
