/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/amqp';

export class HydrogenComponentDto {
  processId: string;
  rfnboType?: string;
  color: string;
  amount: number;

  constructor(processId: string, color: string, amount: number, rfnboType?: string) {
    this.processId = processId;
    this.rfnboType = rfnboType;
    this.color = color;
    this.amount = amount;
  }

  static fromEntity(hydrogenComponentEntity: HydrogenComponentEntity): HydrogenComponentDto {
    return <HydrogenComponentDto>{
      processId: hydrogenComponentEntity.processId,
      color: hydrogenComponentEntity.color,
      amount: hydrogenComponentEntity.amount,
    };
  }
}
