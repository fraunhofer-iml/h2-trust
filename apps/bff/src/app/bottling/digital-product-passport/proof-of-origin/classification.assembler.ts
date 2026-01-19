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
  static assemblePowerClassification(
    classificationName: string,
    batchDtos?: BatchDto[],
    nestedClassificationDtos?: ClassificationDto[],
  ): ClassificationDto {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.POWER,
      BatchType.POWER,
      batchDtos,
      nestedClassificationDtos,
    );
  }

  static assembleHydrogenClassification(
    classificationName: string,
    batchDtos?: BatchDto[],
    nestedClassificationDtos?: ClassificationDto[],
  ): ClassificationDto {
    return this.assembleClassification(
      classificationName,
      MeasurementUnit.HYDROGEN,
      BatchType.HYDROGEN,
      batchDtos,
      nestedClassificationDtos,
    );
  }

  static assembleClassification(
    classificationName: string,
    measurementUnit: MeasurementUnit,
    classificationType: ClassificationType,
    batchDtos: BatchDto[] = [],
    nestedClassificationDtos: ClassificationDto[] = [],
  ): ClassificationDto {
    return new ClassificationDto(
      classificationName,
      this.calculateClassificationEmission(batchDtos, nestedClassificationDtos),
      this.calculateClassificationAmount(batchDtos, nestedClassificationDtos),
      batchDtos,
      nestedClassificationDtos,
      measurementUnit,
      classificationType,
    );
  }

  private static calculateClassificationAmount(
    batchDtos: BatchDto[],
    nestedClassificationDtos: ClassificationDto[],
  ): number {
    return Util.sumAmounts(batchDtos) || Util.sumAmounts(nestedClassificationDtos);
  }

  private static calculateClassificationEmission(
    batchDtos: BatchDto[],
    nestedClassificationDtos: ClassificationDto[],
  ): number {
    const batchEmissionSum = (batchDtos || []).map((b) => b.emission?.amountCO2PerKgH2 ?? 0).reduce((a, b) => a + b, 0);

    const nestedEmissionSum = (nestedClassificationDtos || [])
      .map((c) => c.emissionOfProcessStep ?? 0)
      .reduce((a, b) => a + b, 0);

    return batchEmissionSum + nestedEmissionSum;
  }
}
