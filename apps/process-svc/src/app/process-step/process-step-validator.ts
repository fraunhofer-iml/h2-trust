/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProcessStepPayload } from '@h2-trust/contracts/payloads';
import { TransportType } from '@h2-trust/domain';
import { ValidationException } from '@h2-trust/exceptions';

export function validateTransportProcessStep(transportMode: TransportType, payload: CreateProcessStepPayload): void {
  const validModes = [TransportType.TRAILER, TransportType.PIPELINE];

  if (!validModes.includes(transportMode)) {
    throw new ValidationException(`Invalid transport mode: ${transportMode}`);
  }

  if (transportMode === TransportType.TRAILER) {
    if (!payload.qualityDetails.distance) {
      throw new ValidationException(`Distance is required for transport mode [${TransportType.TRAILER}].`);
    }
  }
}
