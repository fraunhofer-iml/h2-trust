/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/contracts';
import { HydrogenColor, RfnboType } from '@h2-trust/domain';

export class HydrogenComponentDto {
  processId: string | null;
  rfnboType: RfnboType;
  color: HydrogenColor;
  amount: number;

  constructor(processId: string | null, color: HydrogenColor, amount: number, rfnboType: RfnboType) {
    this.processId = processId;
    this.rfnboType = rfnboType;
    this.color = color;
    this.amount = amount;
  }

  static fromEntity(hydrogenComponentEntity: HydrogenComponentEntity): HydrogenComponentDto {
    return <HydrogenComponentDto>{
      processId: hydrogenComponentEntity.processId,
      rfnboType: hydrogenComponentEntity.rfnboType,
      color: hydrogenComponentEntity.color,
      amount: hydrogenComponentEntity.amount,
    };
  }
}
