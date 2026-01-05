/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsNotEmptyObject, IsString } from "class-validator";
import { ParsedFileBundles } from "../../entities";

export class StageProductionsPayload {
  @IsNotEmptyObject()
  data!: ParsedFileBundles

  @IsString()
  @IsNotEmpty()
  userId!: string;

  static of(data: ParsedFileBundles, userId: string): StageProductionsPayload {
    return { data, userId }
  }
}
