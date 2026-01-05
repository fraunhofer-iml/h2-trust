/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsNotEmpty } from 'class-validator';
import { BatchEntity, ProcessStepEntity, TransportationDetailsEntity } from '../../entities';

export class CreateHydrogenTransportationPayload {
  @IsNotEmpty()
  processStep!: ProcessStepEntity;

  @IsNotEmpty()
  predecessorBatch!: BatchEntity;

  @IsNotEmpty()
  transportationDetails!: TransportationDetailsEntity;

  static of(processStep: ProcessStepEntity, predecessorBatch: BatchEntity, transportationDetails: TransportationDetailsEntity): CreateHydrogenTransportationPayload {
    return {
      processStep,
      predecessorBatch,
      transportationDetails,
    };
  }
}
