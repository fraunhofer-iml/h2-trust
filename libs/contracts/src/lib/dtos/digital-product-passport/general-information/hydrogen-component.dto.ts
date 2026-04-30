/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/contracts/entities';
import { RfnboType } from '@h2-trust/domain';

export class HydrogenComponentDto {
  processId: string | null;
  rfnboType: RfnboType;
  amount: number;

  constructor(processId: string | null, amount: number, rfnboType: RfnboType) {
    this.processId = processId;
    this.rfnboType = rfnboType;
    this.amount = amount;
  }

  static fromEntity(hydrogenComponentEntity: HydrogenComponentEntity): HydrogenComponentDto {
    return <HydrogenComponentDto>{
      processId: hydrogenComponentEntity.processId,
      rfnboType: hydrogenComponentEntity.rfnboType,
      amount: hydrogenComponentEntity.amount,
    };
  }
}
