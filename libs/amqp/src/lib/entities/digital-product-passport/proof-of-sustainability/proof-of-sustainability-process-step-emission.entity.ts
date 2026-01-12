/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProofOfSustainabilityProcessStepType = 'APPLICATION' | 'REGULATORY';

export class ProofOfSustainabilityProcessStepEmissionEntity {
  amount: number;
  name: string;
  description: string;
  processStepType: ProofOfSustainabilityProcessStepType;

  constructor(
    amount: number,
    name: string,
    description: string,
    processStepType: ProofOfSustainabilityProcessStepType,
  ) {
    this.amount = amount;
    this.name = name;
    this.description = description;
    this.processStepType = processStepType;
  }
}
