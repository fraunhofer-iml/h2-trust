/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BrokerException } from '@h2-trust/messaging';
import { BatchType, HydrogenColor, PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { BatchEntity, CreateHydrogenBottlingPayload, ProcessStepEntity } from '@h2-trust/contracts';

export class BottlingProcessStepAssembler {
  static assemble(payload: CreateHydrogenBottlingPayload, batchesForBottle: BatchEntity[]): ProcessStepEntity {
    const bottlingTypes = BottlingProcessStepAssembler.determinePredecessorTypes(batchesForBottle);
    return {
      startedAt: payload.filledAt,
      endedAt: payload.filledAt,
      type: ProcessType.HYDROGEN_BOTTLING,
      batch: {
        amount: payload.amount,
        qualityDetails: {
          color: HydrogenColor.MIX,
          rfnboType: bottlingTypes.bottlingRfnboType,
          powerType: bottlingTypes.bottlingPowerType,
        },
        type: BatchType.HYDROGEN,
        predecessors: batchesForBottle.map((batch) => ({
          id: batch.id,
        })) as BatchEntity[],
        owner: { id: payload.ownerId },
      } as BatchEntity,
      recordedBy: { id: payload.recordedById },
      executedBy: { id: payload.hydrogenStorageUnitId },
    } as ProcessStepEntity;
  }

  private static determinePredecessorTypes(predecessors: BatchEntity[]): {
    bottlingRfnboType: RfnboType;
    bottlingPowerType: PowerType;
  } {
    const validPredecessors: BatchEntity[] = predecessors.filter((batch) => batch.qualityDetails !== undefined);

    const rfnboTypes: RfnboType[] = [];
    const powerTypes: PowerType[] = [];

    validPredecessors.forEach((batch) => {
      rfnboTypes.push(batch.qualityDetails.rfnboType);
      powerTypes.push(batch.qualityDetails.powerType);
    });

    if (rfnboTypes.length === 0 || powerTypes.length === 0) {
      throw new BrokerException(`No predecessor type specified`, HttpStatus.BAD_REQUEST);
    }

    const firstRfnboType = rfnboTypes[0];
    const allRfnboTypesAreEqual = rfnboTypes.every((rfnboType) => rfnboType === firstRfnboType);
    const bottlingRfnboType: RfnboType = allRfnboTypesAreEqual ? firstRfnboType : RfnboType.NON_CERTIFIABLE;

    const firstPowerType = powerTypes[0];
    const allPowerTypesAreEqual = powerTypes.every((powerType) => powerType === firstPowerType);
    const bottlingPowerType: PowerType = allPowerTypesAreEqual ? firstPowerType : PowerType.NOT_SPECIFIED;

    return { bottlingRfnboType, bottlingPowerType };
  }
}
