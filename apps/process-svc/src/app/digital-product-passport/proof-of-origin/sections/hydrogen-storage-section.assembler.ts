/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, ProcessType, ProofOfOrigin } from '@h2-trust/domain';
import { assembleHydrogenStorageEmissionCalculations } from '../../proof-of-sustainability/emissions/hydrogen-storage-emission-calculation.assembler';
import { assembleClassification } from '../../util';
import { ProofOfOriginSectionAssembler } from '../proof-of-origin-assembler.interface';

function assembleHydrogenStorageBatch(
  hydrogenStorage: ProcessStepEntity,
  emission?: ProofOfOriginEmissionEntity,
): ProofOfOriginHydrogenBatchEntity {
  return {
    id: hydrogenStorage.batch.id,
    emission,
    createdAt: hydrogenStorage.startedAt,
    amount: hydrogenStorage.batch.amount,
    batchType: BatchType.HYDROGEN,
    hydrogenComposition: [
      {
        processId: null,
        amount: hydrogenStorage.batch.amount,
        rfnboType: hydrogenStorage.batch?.qualityDetails?.rfnboType,
      },
    ],
    producer: hydrogenStorage.batch.owner?.name,
    unitId: hydrogenStorage.executedBy.id,
    rfnboType: hydrogenStorage.batch?.qualityDetails?.rfnboType,
    processStep: hydrogenStorage.type,
    accountingPeriodEnd: hydrogenStorage.endedAt,
  };
}

export function assembleHydrogenStorageSection(storage: ProcessStepEntity): ProofOfOriginSectionEntity {
  const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity[] =
    assembleHydrogenStorageEmissionCalculations(storage);

  const emission: ProofOfOriginEmissionEntity =
    emissionCalculation.length > 0
      ? ProofOfOriginEmissionEntity.fromEmissionCalculation(storage.batch.amount, emissionCalculation[0].result)
      : undefined;

  const classification: ProofOfOriginClassificationEntity = assembleClassification(
    storage.batch.qualityDetails.rfnboType,
    BatchType.HYDROGEN,
    [assembleHydrogenStorageBatch(storage, emission)],
    [],
  );

  return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], [classification]);
}

export function assembleHydrogenStorageSections(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance || !provenance.getAllHydrogenLeafProductions()?.length) {
    return [];
  }

  return provenance
    .getProcessStepsFromChain(ProcessType.HYDROGEN_STORAGE)
    .map((storage) => assembleHydrogenStorageSection(storage));
}

export const hydrogenStorageSectionAssembler: ProofOfOriginSectionAssembler = {
  assembleSection: assembleHydrogenStorageSections,
};
