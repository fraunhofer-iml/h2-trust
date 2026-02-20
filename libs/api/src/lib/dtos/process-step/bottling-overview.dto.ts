/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/amqp';

export class BottlingOverviewDto {
  id: string;
  filledAt: Date;
  owner?: string;
  filledAmount?: number;
  color?: string;
  rfnboType?: string;

  constructor(id: string, filledAt: Date, owner: string, filledAmount: number, color: string, rfnboType?: string) {
    this.id = id;
    this.filledAt = filledAt;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.color = color;
    this.rfnboType = rfnboType;
  }

  static fromEntity(processStep: ProcessStepEntity): BottlingOverviewDto {
    return <BottlingOverviewDto>{
      id: processStep.id,
      filledAt: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      color: processStep.batch?.qualityDetails?.color,
      rfnboType: processStep.batch?.rfnboType,
    };
  }
}
