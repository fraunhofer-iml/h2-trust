/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginBatchEntity, ProofOfOriginClassificationEntity, Util } from '@h2-trust/amqp';
import { BatchType, MeasurementUnit } from '@h2-trust/domain';

export class ClassificationAssembler {
  static assemblePower(
    classificationName: string,
    batches?: ProofOfOriginBatchEntity[],
    nestedClassifications?: ProofOfOriginClassificationEntity[],
  ): ProofOfOriginClassificationEntity {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.POWER,
      BatchType.POWER,
      batches,
      nestedClassifications,
    );
  }

  static assembleHydrogen(
    classificationName: string,
    batches?: ProofOfOriginBatchEntity[],
    nestedClassifications?: ProofOfOriginClassificationEntity[],
  ): ProofOfOriginClassificationEntity {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.HYDROGEN,
      BatchType.HYDROGEN,
      batches,
      nestedClassifications,
    );
  }

  static assembleClassification(
    classificationName: string,
    measurementUnit: MeasurementUnit,
    classificationType: BatchType,
    batches: ProofOfOriginBatchEntity[] = [],
    nestedClassifications: ProofOfOriginClassificationEntity[] = [],
  ): ProofOfOriginClassificationEntity {
    return new ProofOfOriginClassificationEntity(
      classificationName,
      this.calculateEmission(batches, nestedClassifications),
      this.calculateAmount(batches, nestedClassifications),
      measurementUnit,
      classificationType,
      batches,
      nestedClassifications,
    );
  }

  private static calculateEmission(
    batches: ProofOfOriginBatchEntity[],
    nestedClassifications: ProofOfOriginClassificationEntity[],
  ): number {
    const batchEmissionSum = (batches || []).map((b) => b.emission?.amountCO2PerKgH2 ?? 0).reduce((a, b) => a + b, 0);

    const nestedEmissionSum = (nestedClassifications || [])
      .map((c) => c.emissionOfProcessStep ?? 0)
      .reduce((a, b) => a + b, 0);

    return batchEmissionSum + nestedEmissionSum;
  }

  private static calculateAmount(
    batches: ProofOfOriginBatchEntity[],
    nestedClassifications: ProofOfOriginClassificationEntity[],
  ): number {
    return Util.sumAmounts(batches) || Util.sumAmounts(nestedClassifications);
  }
}
