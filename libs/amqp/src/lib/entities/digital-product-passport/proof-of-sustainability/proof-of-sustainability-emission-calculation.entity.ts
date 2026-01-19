/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalculationTopic } from '@h2-trust/domain';

export class ProofOfSustainabilityEmissionCalculationEntity {
  name: string;
  basisOfCalculation: string[];
  result: number;
  unit: string;
  calculationTopic: CalculationTopic;

  constructor(
    name: string,
    basisOfCalculation: string[],
    result: number,
    unit: string,
    calculationTopic: CalculationTopic,
  ) {
    this.name = name;
    this.basisOfCalculation = basisOfCalculation;
    this.result = result;
    this.unit = unit;
    this.calculationTopic = calculationTopic;
  }
}
