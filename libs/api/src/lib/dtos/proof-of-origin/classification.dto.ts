/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClassificationType } from '../../types/classification-type.type';
import { BatchDto } from './batch.dto';

/**
 * Classifications for aggregation of batches or classifications
 * representing all levels in between sections and batches
 * @example power supply, grid power, green hydrogen
 */
export class ClassificationDto {
  name: string;
  emissionOfProcessStep: number;
  amount: number;
  batches: BatchDto[];
  classifications: ClassificationDto[];
  /**
   * measuring unit for amount
   */
  unit: string;
  classificationType: ClassificationType;

  constructor(
    name: string,
    emissionOfProcessStep: number,
    amount: number,
    batches: BatchDto[],
    classifications: ClassificationDto[],
    unit: string,
    type: ClassificationType,
  ) {
    this.name = name;
    this.emissionOfProcessStep = emissionOfProcessStep;
    this.amount = amount;
    this.batches = batches;
    this.classifications = classifications;
    this.unit = unit;
    this.classificationType = type;
  }
}
