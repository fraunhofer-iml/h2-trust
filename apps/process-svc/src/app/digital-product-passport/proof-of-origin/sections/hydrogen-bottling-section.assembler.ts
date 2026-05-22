/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenComponentEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { BatchType, ProofOfOrigin } from '@h2-trust/domain';
import { assembleComposition } from '../../../bottling/utils/hydrogen-composition';
import { assembleHydrogenBottlingEmissionCalculation } from '../../proof-of-sustainability/emissions/hydrogen-bottling-emission-calculation.assembler';
import { ProofOfOriginSectionAssembler } from '../proof-of-origin-assembler.interface';

export function assembleHydrogenBottlingSection(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance.hydrogenBottling) {
    return [];
  }

  const hydrogenComponentsOfBottling: HydrogenComponentEntity[] = assembleComposition(provenance);
  const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
    assembleHydrogenBottlingEmissionCalculation(provenance.hydrogenBottling);

  const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
    provenance.hydrogenBottling.batch.amount,
    emissionCalculation.result,
    emissionCalculation.basisOfCalculation,
  );

  const batch: ProofOfOriginHydrogenBatchEntity = {
    id: provenance.hydrogenBottling.batch.id,
    emission,
    createdAt: provenance.hydrogenBottling.startedAt,
    amount: provenance.hydrogenBottling.batch.amount,
    batchType: BatchType.HYDROGEN,
    hydrogenComposition: hydrogenComponentsOfBottling,
    unitId: provenance.hydrogenBottling.executedBy.id,
    rfnboType: provenance.hydrogenBottling.batch?.qualityDetails?.rfnboType,
    processStep: provenance.hydrogenBottling.type,
    accountingPeriodEnd: provenance.hydrogenBottling.endedAt,
  };

  return [new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION, [batch], [])];
}

export const hydrogenBottlingSectionAssembler: ProofOfOriginSectionAssembler = {
  assembleSection: assembleHydrogenBottlingSection,
};
