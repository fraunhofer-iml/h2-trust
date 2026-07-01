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
import { assembleHydrogenTransportationEmissionCalculation } from '../../proof-of-sustainability/emissions/hydrogen-transportation-emission-calculation.assembler';
import { ProofOfOriginSectionAssembler } from '../proof-of-origin-assembler.interface';

function assembleHydrogenTransportationBatch(
  hydrogenTransportation: ProcessStepEntity,
  hydrogenComposition: HydrogenComponentEntity[],
  emission?: ProofOfOriginEmissionEntity,
): ProofOfOriginHydrogenBatchEntity {
  return {
    id: hydrogenTransportation.batch.id,
    emission,
    createdAt: hydrogenTransportation.startedAt,
    amount: hydrogenTransportation.batch.amount,
    batchType: BatchType.HYDROGEN,
    hydrogenComposition: hydrogenComposition,
    unitId: hydrogenTransportation.executedBy.id,
    rfnboType: hydrogenTransportation.batch?.details?.rfnboType,
    processStep: hydrogenTransportation.type,
    accountingPeriodEnd: hydrogenTransportation.endedAt,
  };
}

export function assembleHydrogenTransportationSection(
  hydrogenTransportation: ProcessStepEntity,
  provenance: ProvenanceEntity,
): ProofOfOriginSectionEntity {
  const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
    assembleHydrogenTransportationEmissionCalculation(hydrogenTransportation);

  const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
    hydrogenTransportation.batch.amount,
    emissionCalculation.result,
    emissionCalculation.basisOfCalculation,
  );

  const hydrogenComponents: HydrogenComponentEntity[] = assembleComposition(hydrogenTransportation, provenance);

  const batch: ProofOfOriginHydrogenBatchEntity = assembleHydrogenTransportationBatch(
    hydrogenTransportation,
    hydrogenComponents,
    emission,
  );

  return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION, [batch], []);
}

export function assembleHydrogenTransportationSections(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
  if (!provenance) {
    return [];
  }

  return provenance
    .getProcessStepsFromChain(ProcessType.HYDROGEN_TRANSPORTATION)
    .map((transport) => assembleHydrogenTransportationSection(transport, provenance));
}

export const hydrogenTransportationSectionAssembler: ProofOfOriginSectionAssembler = {
  assembleSection: assembleHydrogenTransportationSections,
};
