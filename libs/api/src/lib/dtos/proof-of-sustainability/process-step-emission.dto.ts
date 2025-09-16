/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmissionProcessStepType } from '../../types';

export class EmissionForProcessStepDto {
  amount: number;
  name: string;
  description: string;
  processStepType: EmissionProcessStepType;

  constructor(amount: number, name: string, description: string, processStepType: EmissionProcessStepType) {
    this.amount = amount;
    this.name = name;
    this.description = description;
    this.processStepType = processStepType;
  }
}
