/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Util } from '@h2-trust/amqp';
import { BatchDto, ClassificationDto, ClassificationType } from '@h2-trust/api';
import { BatchType, MeasurementUnit } from '@h2-trust/domain';

export class ClassificationAssembler {
  static assemblePower(
    classificationName: string,
    batches?: BatchDto[],
    nestedClassifications?: ClassificationDto[],
  ): ClassificationDto {
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
    batches?: BatchDto[],
    nestedClassifications?: ClassificationDto[],
  ): ClassificationDto {
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
    classificationType: ClassificationType,
    batches: BatchDto[] = [],
    nestedClassifications: ClassificationDto[] = [],
  ): ClassificationDto {
    return new ClassificationDto(
      classificationName,
      this.calculateEmission(batches, nestedClassifications),
      this.calculateAmount(batches, nestedClassifications),
      null, // TBA
      batches,
      nestedClassifications,
      measurementUnit,
      classificationType,
    );
  }

  private static calculateEmission(
    batches: BatchDto[],
    nestedClassifications: ClassificationDto[],
  ): number {
    const batchEmissionSum = (batches || []).map((b) => b.emission?.amountCO2PerKgH2 ?? 0).reduce((a, b) => a + b, 0);

    const nestedEmissionSum = (nestedClassifications || [])
      .map((c) => c.emissionOfProcessStep ?? 0)
      .reduce((a, b) => a + b, 0);

    return batchEmissionSum + nestedEmissionSum;
  }

  private static calculateAmount(
    batches: BatchDto[],
    nestedClassifications: ClassificationDto[],
  ): number {
    return Util.sumAmounts(batches) || Util.sumAmounts(nestedClassifications);
  }
}
