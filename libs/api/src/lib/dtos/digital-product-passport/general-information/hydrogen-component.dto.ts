/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/amqp';

export class HydrogenComponentDto {
  color: string;
  amount: number;

  constructor(color: string, amount: number) {
    this.color = color;
    this.amount = amount;
  }

  static fromEntity(hydrogenComponentEntity: HydrogenComponentEntity): HydrogenComponentDto {
    return <HydrogenComponentDto>{
      color: hydrogenComponentEntity.color,
      amount: hydrogenComponentEntity.amount,
    };
  }
}
