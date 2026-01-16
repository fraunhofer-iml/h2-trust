/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class ProofOfOriginEmissionEntity {
  amountCO2: number;
  amountCO2PerKgH2: number;
  basisOfCalculation: string[];

  constructor(amountCO2: number, amountCO2PerKgH2: number, basisOfCalculation: string[]) {
    this.amountCO2 = amountCO2;
    this.amountCO2PerKgH2 = amountCO2PerKgH2;
    this.basisOfCalculation = basisOfCalculation;
  }
}
