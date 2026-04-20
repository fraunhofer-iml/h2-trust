/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class ImportSubmissionDto {
  @IsString()
  @IsNotEmpty()
  importId: string;

  @IsString()
  @IsNotEmpty()
  storageUnitId: string;

  constructor(importId: string, storageUnitId: string) {
    this.importId = importId;
    this.storageUnitId = storageUnitId;
  }
}
