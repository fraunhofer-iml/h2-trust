/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProofOfSustainabilityEmissionType = 'APPLICATION' | 'REGULATORY';

export class ProofOfSustainabilityEmissionEntity {
  amount: number;
  name: string;
  description: string;
  emissionType: ProofOfSustainabilityEmissionType;

  constructor(
    amount: number,
    name: string,
    description: string,
    emissionType: ProofOfSustainabilityEmissionType,
  ) {
    this.amount = amount;
    this.name = name;
    this.description = description;
    this.emissionType = emissionType;
  }
}
