/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray } from 'class-validator';

export class ReadByIdsPayload {
  @IsArray()
  ids: string[];

  constructor(ids: string[]) {
    this.ids = ids;
  }
}
