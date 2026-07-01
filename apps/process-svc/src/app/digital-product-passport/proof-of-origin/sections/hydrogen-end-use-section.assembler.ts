/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, ProcessType, ProofOfOrigin } from '@h2-trust/domain';
import { assembleComposition } from '../../../process-step/utils/hydrogen-composition';
import { assembleHydrogenEndUseEmissionCalculation } from '../../proof-of-sustainability/emissions/hydrogen-end-use-emission-calculation.assembler';
import { ProofOfOriginSectionAssembler } from '../proof-of-origin-assembler.interface';

export function assembleHydrogenEndUseSection(
  endUse: ProcessStepEntity,
  provenance: ProvenanceEntity,
): ProofOfOriginSectionEntity {
  const hydrogenComponentsOfEndUse: HydrogenComponentEntity[] = assembleComposition(endUse, provenance);
  const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
    assembleHydrogenEndUseEmissionCalculation(endUse);

  const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
    endUse.batch.amount,
    emissionCalculation.result,
    emissionCalculation.basisOfCalculation,
  );

  const batch: ProofOfOriginHydrogenBatchEntity = {
    id: endUse.batch.id,
    emission,
    createdAt: endUse.startedAt,
    amount: endUse.batch.amount,
    batchType: BatchType.HYDROGEN,
    hydrogenComposition: hydrogenComponentsOfEndUse,
    unitId: endUse.executedBy.id,
    rfnboType: endUse.batch?.details?.rfnboType,
    processStep: endUse.type,
    accountingPeriodEnd: endUse.endedAt,
  };

  return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_END_USE_SECTION, [batch], []);
}

export function assembleHydrogenEndUseSections(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance) {
    return [];
  }

  return provenance
    .getProcessStepsFromChain(ProcessType.HYDROGEN_END_USE)
    .map((endUse) => assembleHydrogenEndUseSection(endUse, provenance));
}

export const hydrogenEndUseSectionAssembler: ProofOfOriginSectionAssembler = {
  assembleSection: assembleHydrogenEndUseSections,
};
