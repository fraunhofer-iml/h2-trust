/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { RfnboType } from '@h2-trust/domain';

export class ProcessStepOverviewDto {
  id: string;
  filledAt: Date;
  owner?: string;
  filledAmount?: number;
  rfnboType?: RfnboType;

  constructor(id: string, filledAt: Date, owner: string, filledAmount: number, rfnboType?: RfnboType) {
    this.id = id;
    this.filledAt = filledAt;
    this.owner = owner;
    this.filledAmount = filledAmount;
    this.rfnboType = rfnboType;
  }

  static fromEntity(processStep: ProcessStepEntity): ProcessStepOverviewDto {
    return <ProcessStepOverviewDto>{
      id: processStep.id,
      filledAt: processStep.endedAt,
      owner: processStep.batch?.owner?.name,
      filledAmount: processStep.batch?.amount,
      rfnboType: processStep.batch?.qualityDetails?.rfnboType,
    };
  }
}
