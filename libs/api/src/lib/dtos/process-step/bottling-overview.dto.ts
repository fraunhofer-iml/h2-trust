/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';
import { parseColor } from '../util';

export class BottlingOverviewDto {
  id: string;
  filledAt: Date;
  owner?: string;
  filledAmount?: number;
  color?: string;

  constructor(id: string, filledAt: Date, owner: string, filledAmount: number, color: string) {
    this.id = id;
    this.filledAt = filledAt;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.color = color;
  }

  static fromEntity(processStep: ProcessStepEntity): BottlingOverviewDto {
    return <BottlingOverviewDto>{
      id: processStep.id,
      filledAt: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      color: parseColor(processStep.batch?.quality),
    };
  }
}
