/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsString } from 'class-validator';

export class ReadByIdPayload {
  @IsString()
  id!: string;

  static of(id: string): ReadByIdPayload {
    return { id };
  }
}
