/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity, ProcessStepEntity } from '@h2-trust/contracts';
import { BatchType, HydrogenColor, PowerType, RfnboType } from '@h2-trust/domain';

export class ProductionOverviewDto {
  startedAt: string;
  endedAt: string;
  productionUnit: string;
  producedAmount: number;
  color: HydrogenColor;
  rfnboType: RfnboType;
  powerProducer: string;
  powerConsumed: number;
  storageUnit: string;
  powerType: PowerType;
  powerProductionUnit: string;

  constructor(
    startedAt: string,
    endedAt: string,
    productionUnit: string,
    producedAmount: number,
    color: HydrogenColor,
    rfnboType: RfnboType,
    powerProducer: string,
    powerConsumed: number,
    storageUnit: string,
    powerType: PowerType,
    powerProductionUnit: string,
  ) {
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.productionUnit = productionUnit;
    this.producedAmount = producedAmount;
    this.color = color;
    this.rfnboType = rfnboType;
    this.powerProducer = powerProducer;
    this.powerConsumed = powerConsumed;
    this.storageUnit = storageUnit;
    this.powerType = powerType;
    this.powerProductionUnit = powerProductionUnit;
  }

  static fromEntity(processStep: ProcessStepEntity): ProductionOverviewDto {
    return <ProductionOverviewDto>{
      startedAt: processStep.startedAt.toString(),
      endedAt: processStep.endedAt.toString(),
      productionUnit: processStep.executedBy?.name,
      producedAmount: processStep.batch?.amount,
      color: processStep.batch?.qualityDetails?.color,
      rfnboType: processStep.batch?.qualityDetails?.rfnboType,
      powerProducer: processStep.batch?.predecessors?.[0]?.owner?.name,
      powerConsumed: ProductionOverviewDto.determinePowerConsumed(processStep),
      storageUnit: processStep.batch?.hydrogenStorageUnit?.name,
      // TODO: replace powerProductionUnit & powerType with actual values (DUHGW-271)
      powerProductionUnit: 'power-production-unit',
      powerType: processStep.batch?.qualityDetails?.powerType ?? PowerType.NOT_SPECIFIED,
    };
  }

  private static determinePowerConsumed(processStep: ProcessStepEntity) {
    const powerPredecessorBatches = processStep.batch?.predecessors?.filter(
      (predecessor) => predecessor.type === BatchType.POWER,
    );
    if (!powerPredecessorBatches?.length) {
      return null;
    }
    return this.summarizeBatchAmounts(powerPredecessorBatches);
  }

  private static summarizeBatchAmounts(powerPredecessorBatches: BatchEntity[]): number {
    return powerPredecessorBatches.reduce((sum, batch) => sum + (batch.amount ?? 0), 0);
  }
}
