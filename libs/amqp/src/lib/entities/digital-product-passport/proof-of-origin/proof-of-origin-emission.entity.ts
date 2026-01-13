/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProofOfOriginEmission {
  amountCO2: number;
  amountCO2PerKgH2: number;
  basisOfCalculation: string[];
}

/**
 * @deprecated Use ProofOfOriginEmission interface instead
 */
export type ProofOfOriginEmissionEntity = ProofOfOriginEmission;
