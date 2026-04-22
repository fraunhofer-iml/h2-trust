/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty } from 'class-validator';
import { ProductionDataFilter } from './production-data-filter';
import { ReadProcessStepsByPredecessorTypesAndOwnerPayload } from './read-process-steps-by-predecessor-types-and-company.payload';

export class ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload extends ReadProcessStepsByPredecessorTypesAndOwnerPayload {
  @IsNotEmpty()
  filter: ProductionDataFilter;

  constructor(predecessorProcessTypes: string[], ownerId: string, filter: ProductionDataFilter) {
    super(predecessorProcessTypes, ownerId);
    this.filter = filter;
  }
}
