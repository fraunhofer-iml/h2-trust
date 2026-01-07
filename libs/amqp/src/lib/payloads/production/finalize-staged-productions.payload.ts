/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class FinalizeStagedProductionsPayload {
  @IsString()
  @IsNotEmpty()
  recordedBy: string;

  @IsString()
  @IsNotEmpty()
  hydrogenStorageUnitId: string;

  @IsString()
  @IsNotEmpty()
  importId: string;

  constructor(recordedBy: string, hydrogenStorageUnitId: string, importId: string) {
    this.recordedBy = recordedBy;
    this.hydrogenStorageUnitId = hydrogenStorageUnitId;
    this.importId = importId;
  }
}
