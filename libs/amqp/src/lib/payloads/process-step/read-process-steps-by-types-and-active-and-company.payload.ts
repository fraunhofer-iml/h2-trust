/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReadProcessStepsByTypesAndActiveAndCompanyPayload {
  @IsArray()
  @IsNotEmpty()
  processTypes!: string[];

  @IsBoolean()
  @IsNotEmpty()
  active!: boolean;

  @IsString()
  @IsNotEmpty()
  companyId!: string;

  static of(
    processTypes: string[],
    active: boolean,
    companyId: string,
  ): ReadProcessStepsByTypesAndActiveAndCompanyPayload {
    return {
      processTypes,
      active,
      companyId,
    };
  }
}
