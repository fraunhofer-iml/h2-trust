/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginBatchEntity, ProofOfOriginSubClassificationEntity } from '@h2-trust/amqp';

export class Util {
  static sumAmounts(arrayWithAmount: { amount: number }[]): number {
    return arrayWithAmount.reduce((sum, item) => sum + item.amount, 0);
  }

  static calculateBatchEmission(batches: ProofOfOriginBatchEntity[]): number {
    return (batches || []).map((b) => b.emission?.totalEmissions ?? 0).reduce((a, b) => a + b, 0);
  }

  static calculateAmount(
    batches: ProofOfOriginBatchEntity[],
    subClassifications: ProofOfOriginSubClassificationEntity[],
  ): number {
    return Util.sumAmounts(batches) || Util.sumAmounts(subClassifications);
  }

  static calculateEmission(
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
