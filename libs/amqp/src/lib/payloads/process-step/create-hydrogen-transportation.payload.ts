/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { BatchEntity, ProcessStepEntity, TransportationDetailsEntity } from '../../entities';

export class CreateHydrogenTransportationPayload {
  @IsNotEmpty()
  @Type(() => ProcessStepEntity)
  processStep: ProcessStepEntity;

  @IsNotEmpty()
  @Type(() => BatchEntity)
  predecessorBatch: BatchEntity;

  @IsNotEmpty()
  @Type(() => TransportationDetailsEntity)
  transportationDetails: TransportationDetailsEntity;

  constructor(
    processStep: ProcessStepEntity,
    predecessorBatch: BatchEntity,
    transportationDetails: TransportationDetailsEntity,
  ) {
    this.processStep = processStep;
    this.predecessorBatch = predecessorBatch;
    this.transportationDetails = transportationDetails;
  }
}
