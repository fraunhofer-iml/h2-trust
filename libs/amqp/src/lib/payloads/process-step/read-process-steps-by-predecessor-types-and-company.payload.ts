/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReadProcessStepsByPredecessorTypesAndCompanyPayload {
  @IsArray()
  @IsNotEmpty()
  predecessorProcessTypes!: string[];

  @IsString()
  @IsNotEmpty()
  companyId!: string;

  static of(predecessorProcessTypes: string[], companyId: string): ReadProcessStepsByPredecessorTypesAndCompanyPayload {
    return { predecessorProcessTypes, companyId };
  }
}
