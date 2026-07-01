/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BatchDetailsEntity,
  BatchEntity,
  CompanyEntity,
  ProcessStepEntity,
  UnitEntity,
  UserEntity,
} from '@h2-trust/contracts/entities';
import { CreateProcessStepPayload } from '@h2-trust/contracts/payloads';
import { BatchType, PowerType, RfnboType } from '@h2-trust/domain';
import { InternalException } from '@h2-trust/exceptions';

export function buildProcessStepEntity(
  payload: CreateProcessStepPayload,
  predecessors: BatchEntity[],
  executingUnit: UnitEntity,
): ProcessStepEntity {
  const bottlingTypes = determinePredecessorTypes(predecessors);
  const batchDetails: BatchDetailsEntity = new BatchDetailsEntity(
    null,
    bottlingTypes.combinedRfnboType,
    bottlingTypes.combinedPowerType,
    payload.batchDetails.usedRenewablePower,
    payload.batchDetails.usedGridPower,
    payload.batchDetails.distance,
    payload.batchDetails.wasteWater,
    payload.batchDetails.resinConsumption,
    payload.batchDetails.compressedAir,
    payload.batchDetails.nitrogenConsumption,
  );
  const batch = new BatchEntity(
    null,
    true,
    payload.amount,
    BatchType.HYDROGEN,
    predecessors.map((batch) => ({
      id: batch.id,
    })) as BatchEntity[],
    [],
    { id: payload.ownerId } as CompanyEntity,
    batchDetails,
  );
  return new ProcessStepEntity(
    null,
    payload.startedAt,
    payload.endedAt,
    payload.processType,
    batch,
    { id: payload.recordedById } as UserEntity,
    executingUnit,
    null,
  );
}

//Since it is possible that the predecessors have different Rfnbo types or productionPowerTypes, all predecessors are checked.
//If all predecessors are of type RfnboReady, then the successor is also RfnboReady. Otherwise, the successor is NonCertifiable.
function determinePredecessorTypes(predecessors: BatchEntity[]): {
  combinedRfnboType: RfnboType;
  combinedPowerType: PowerType;
} {
  const validPredecessors: BatchEntity[] = predecessors.filter((batch) => batch.details !== undefined);

  const rfnboTypes: RfnboType[] = [];
  const powerTypes: PowerType[] = [];

  validPredecessors.forEach((batch) => {
    rfnboTypes.push(batch.details.rfnboType);
    powerTypes.push(batch.details.productionPowerType);
  });

  if (rfnboTypes.length === 0 || powerTypes.length === 0) {
    throw new InternalException('No predecessor types found: batch list has no quality details');
  }

  const firstRfnboType = rfnboTypes[0];
  const allRfnboTypesAreEqual = rfnboTypes.every((rfnboType) => rfnboType === firstRfnboType);
  const bottlingRfnboType: RfnboType = allRfnboTypesAreEqual ? firstRfnboType : RfnboType.NON_CERTIFIABLE;

  const firstPowerType = powerTypes[0];
  const allPowerTypesAreEqual = powerTypes.every((powerType) => powerType === firstPowerType);
  const bottlingPowerType: PowerType = allPowerTypesAreEqual ? firstPowerType : PowerType.NOT_SPECIFIED;

  return { combinedRfnboType: bottlingRfnboType, combinedPowerType: bottlingPowerType };
}
