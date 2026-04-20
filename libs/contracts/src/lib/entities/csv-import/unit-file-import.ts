/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class UnitFileImport {
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsString()
  @IsNotEmpty()
  hashedFileBuffer: string;

  @IsString()
  @IsNotEmpty()
  encodedFileBuffer: string;

  constructor(unitId: string, hashedFileBuffer: string, encodedFileBuffer: string) {
    this.unitId = unitId;
    this.hashedFileBuffer = hashedFileBuffer;
    this.encodedFileBuffer = encodedFileBuffer;
  }
}
