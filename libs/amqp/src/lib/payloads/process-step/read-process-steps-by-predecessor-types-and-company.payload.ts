/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class ReadProcessStepsByPredecessorTypesAndOwnerPayload {
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsNotEmpty()
  predecessorProcessTypes: string[];

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  constructor(predecessorProcessTypes: string[], ownerId: string) {
    this.predecessorProcessTypes = predecessorProcessTypes;
    this.ownerId = ownerId;
  }
}
