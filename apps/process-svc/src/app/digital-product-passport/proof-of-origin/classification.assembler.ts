/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginBatchEntity, ProofOfOriginClassificationEntity, ProofOfOriginSubClassificationEntity, Util } from '@h2-trust/amqp';
import { BatchType, MeasurementUnit } from '@h2-trust/domain';

export class ClassificationAssembler {
  static assemblePower(
    classificationName: string,
    batches?: ProofOfOriginBatchEntity[],
    subClassifications?: ProofOfOriginSubClassificationEntity[],
  ): ProofOfOriginClassificationEntity {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.POWER,
      BatchType.POWER,
      batches,
      subClassifications,
    );
  }

  static assembleHydrogen(
    classificationName: string,
    batches?: ProofOfOriginBatchEntity[],
    subClassifications?: ProofOfOriginSubClassificationEntity[],
  ): ProofOfOriginClassificationEntity {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.HYDROGEN,
      BatchType.HYDROGEN,
      batches,
      subClassifications,
    );
  }

  static assembleClassification(
    classificationName: string,
    measurementUnit: MeasurementUnit,
    classificationType: BatchType,
    batches: ProofOfOriginBatchEntity[] = [],
    subClassifications: ProofOfOriginSubClassificationEntity[] = [],
  ): ProofOfOriginClassificationEntity {
    return new ProofOfOriginClassificationEntity(
      classificationName,
      this.calculateEmission(batches, subClassifications),
      this.calculateAmount(batches, subClassifications),
      measurementUnit,
      classificationType,
      batches,
      subClassifications,
    );
  }

  static assembleSubClassification(
    classificationName: string,
    measurementUnit: MeasurementUnit,
    classificationType: BatchType,
    batches: ProofOfOriginBatchEntity[] = [],
  ): ProofOfOriginSubClassificationEntity {
    return {
      name: classificationName,
      emissionOfProcessStep: this.calculateBatchEmission(batches),
      amount: Util.sumAmounts(batches),
      batches,
      unit: measurementUnit,
      classificationType,
    };
  }

  private static calculateEmission(
    batches: ProofOfOriginBatchEntity[],
    subClassifications: ProofOfOriginSubClassificationEntity[],
  ): number {
    const batchEmissionSum = this.calculateBatchEmission(batches);
    const subClassificationEmissionSum = (subClassifications || [])
      .map((c) => c.emissionOfProcessStep ?? 0)
      .reduce((a, b) => a + b, 0);

    return batchEmissionSum + subClassificationEmissionSum;
  }

  private static calculateBatchEmission(batches: ProofOfOriginBatchEntity[]): number {
    return (batches || []).map((b) => b.emission?.amountCO2PerKgH2 ?? 0).reduce((a, b) => a + b, 0);
  }

  private static calculateAmount(
    batches: ProofOfOriginBatchEntity[],
    subClassifications: ProofOfOriginSubClassificationEntity[],
  ): number {
    return Util.sumAmounts(batches) || Util.sumAmounts(subClassifications);
  }
}
