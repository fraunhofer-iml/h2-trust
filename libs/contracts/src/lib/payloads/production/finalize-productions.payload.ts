/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class FinalizeProductionsPayload {
  @IsString()
  @IsNotEmpty()
  stagedHydrogenProduction: string;

  @IsNotEmpty()
  @IsArray()
  stagedPowerProductions: string[];

  @IsString()
  @IsNotEmpty()
  storageUnitId: string;

  @IsString()
  @IsNotEmpty()
  recordedBy: string;

  constructor(
    recordedBy: string,
    stagedHydrogenProduction: string,
    stagedPowerProductions: string[],
    storageUnitId: string,
  ) {
    this.recordedBy = recordedBy;
    this.stagedHydrogenProduction = stagedHydrogenProduction;
    this.stagedPowerProductions = stagedPowerProductions;
    this.storageUnitId = storageUnitId;
  }
}
