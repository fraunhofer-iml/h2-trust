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
import { assembleHydrogenCompressionEmissionCalculation } from '../../proof-of-sustainability/emissions/hydrogen-compression-emission-calculation.assembler';
import { ProofOfOriginSectionAssembler } from '../proof-of-origin-assembler.interface';

export function assembleHydrogenCompressionSection(
  compression: ProcessStepEntity,
  provenance: ProvenanceEntity,
): ProofOfOriginSectionEntity {
  const hydrogenComponentsOfCompression: HydrogenComponentEntity[] = assembleComposition(compression, provenance);
  const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
    assembleHydrogenCompressionEmissionCalculation(compression);

  const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
    compression.batch.amount,
    emissionCalculation.result,
    emissionCalculation.basisOfCalculation,
  );

  const batch: ProofOfOriginHydrogenBatchEntity = {
    id: compression.batch.id,
    emission,
    createdAt: compression.startedAt,
    amount: compression.batch.amount,
    batchType: BatchType.HYDROGEN,
    hydrogenComposition: hydrogenComponentsOfCompression,
    unitId: compression.executedBy.id,
    rfnboType: compression.batch?.details?.rfnboType,
    processStep: compression.type,
    accountingPeriodEnd: compression.endedAt,
  };

  return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_COMPRESSION_SECTION, [batch], []);
}

export function assembleHydrogenCompressionSections(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance) {
    return [];
  }

  return provenance
    .getProcessStepsFromChain(ProcessType.HYDROGEN_COMPRESSION)
    .map((compression) => assembleHydrogenCompressionSection(compression, provenance));
}

export const hydrogenCompressionSectionAssembler: ProofOfOriginSectionAssembler = {
  assembleSection: assembleHydrogenCompressionSections,
};
