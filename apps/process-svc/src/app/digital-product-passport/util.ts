/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProofOfOriginBatchEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginSubClassificationEntity,
} from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';

export class Util {
  static assembleClassification(
    classificationName: string,
    classificationType: BatchType,
    batches: ProofOfOriginBatchEntity[],
    subClassifications: ProofOfOriginSubClassificationEntity[],
  ): ProofOfOriginClassificationEntity {
    return new ProofOfOriginClassificationEntity(
      classificationName,
      Util.calculateEmission(batches, subClassifications),
      Util.calculateAmount(batches, subClassifications),
      classificationType,
      batches,
      subClassifications,
    );
  }

  static assembleSubClassification(
    classificationName: string,
    classificationType: BatchType,
    batches: ProofOfOriginBatchEntity[] = [],
  ): ProofOfOriginSubClassificationEntity {
    return {
      name: classificationName,
      emissionOfProcessStep: Util.calculateBatchEmission(batches),
      amount: Util.sumAmounts(batches),
      batches,
      classificationType,
    };
  }

  public static sumAmounts(arrayWithAmount: { amount: number }[]): number {
    return arrayWithAmount.reduce((sum, item) => sum + item.amount, 0);
  }

  public static calculateBatchEmission(batches: ProofOfOriginBatchEntity[]): number {
    return (batches || []).map((b) => b.emission?.totalEmissions ?? 0).reduce((a, b) => a + b, 0);
  }

  private static calculateAmount(
    batches: ProofOfOriginBatchEntity[],
    subClassifications: ProofOfOriginSubClassificationEntity[],
  ): number {
    return Util.sumAmounts(batches) || Util.sumAmounts(subClassifications);
  }

  private static calculateEmission(
    batches: ProofOfOriginBatchEntity[],
    subClassifications: ProofOfOriginSubClassificationEntity[],
  ): number {
    const batchEmissionSum = Util.calculateBatchEmission(batches);
    const subClassificationEmissionSum = (subClassifications || [])
      .map((c) => c.emissionOfProcessStep ?? 0)
      .reduce((a, b) => a + b, 0);

    return batchEmissionSum + subClassificationEmissionSum;
  }
}
