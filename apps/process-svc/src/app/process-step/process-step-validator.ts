/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { CreateProcessStepPayload } from '@h2-trust/contracts/payloads';
import { ProcessType, ProcessTypeToUnitType, TransportType } from '@h2-trust/domain';
import { ValidationException } from '@h2-trust/exceptions';

export function validateUnitType(payload: CreateProcessStepPayload, executingUnit: UnitEntity): void {
  const allowedUnitType = ProcessTypeToUnitType[payload.processType];
  if (executingUnit.unitType !== allowedUnitType) {
    throw new ValidationException(
      `Executing unit has the wrong type ${executingUnit.unitType} for process type: ${payload.processType}`,
    );
  }
}

export function validateEmissionData(payload: CreateProcessStepPayload, executingUnit: UnitEntity): void {
  if (
    payload.processType === ProcessType.HYDROGEN_COMPRESSION ||
    payload.processType === ProcessType.HYDROGEN_BOTTLING ||
    payload.processType === ProcessType.HYDROGEN_END_USE
  ) {
    if (payload.batchDetails.usedGridPower == null || payload.batchDetails.usedRenewablePower == null) {
      throw new ValidationException(`Missing power information for process step ${payload.processType}`);
    }
  }

  if (payload.processType === ProcessType.HYDROGEN_BOTTLING || payload.processType === ProcessType.HYDROGEN_END_USE) {
    if (payload.batchDetails.compressedAir == null || payload.batchDetails.nitrogenConsumption == null) {
      throw new ValidationException(`Missing emission information for process step ${payload.processType}`);
    }
  }

  if (payload.processType === ProcessType.HYDROGEN_TRANSPORTATION) {
    if (payload.batchDetails.distance == null && executingUnit.details.type === TransportType.TRAILER) {
      throw new ValidationException(`Distance is required for transport mode [${TransportType.TRAILER}].`);
    }
  }
}
