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
import { assembleHydrogenBottlingEmissionCalculation } from '../../proof-of-sustainability/emissions/hydrogen-bottling-emission-calculation.assembler';
import { ProofOfOriginSectionAssembler } from '../proof-of-origin-assembler.interface';

export function assembleHydrogenBottlingSection(
  bottling: ProcessStepEntity,
  provenance: ProvenanceEntity,
): ProofOfOriginSectionEntity {
  const hydrogenComponentsOfBottling: HydrogenComponentEntity[] = assembleComposition(bottling, provenance);
  const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
    assembleHydrogenBottlingEmissionCalculation(bottling);

  const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
    bottling.batch.amount,
    emissionCalculation.result,
    emissionCalculation.basisOfCalculation,
  );

  const batch: ProofOfOriginHydrogenBatchEntity = {
    id: bottling.batch.id,
    emission,
    createdAt: bottling.startedAt,
    amount: bottling.batch.amount,
    batchType: BatchType.HYDROGEN,
    hydrogenComposition: hydrogenComponentsOfBottling,
    unitId: bottling.executedBy.id,
    rfnboType: bottling.batch?.qualityDetails?.rfnboType,
    processStep: bottling.type,
    accountingPeriodEnd: bottling.endedAt,
  };

  return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION, [batch], []);
}

export function assembleHydrogenBottlingSections(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance) {
    return [];
  }

  return provenance
    .getProcessStepsFromChain(ProcessType.HYDROGEN_BOTTLING)
    .map((bottling) => assembleHydrogenBottlingSection(bottling, provenance));
}

export const hydrogenBottlingSectionAssembler: ProofOfOriginSectionAssembler = {
  assembleSection: assembleHydrogenBottlingSections,
};
