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
} from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin } from '@h2-trust/domain';
import { EmissionAssembler } from './emission.assembler';

export class HydrogenBottlingSectionAssembler {
  static assembleSection(
    hydrogenBottling: ProcessStepEntity,
    hydrogenCompositions: HydrogenComponentEntity[],
  ): ProofOfOriginSectionEntity {
    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      EmissionAssembler.assembleHydrogenBottling(hydrogenBottling);

    const emission: ProofOfOriginEmissionEntity = EmissionAssembler.assembleEmissionEntity(
      emissionCalculation,
      hydrogenBottling.batch.amount,
    );

    const batch: ProofOfOriginHydrogenBatchEntity = this.assembleHydrogenBottling(
      hydrogenBottling,
      hydrogenCompositions,
      emission,
    );

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION, [batch], []);
  }

  static assembleHydrogenBottling(
    hydrogenBottling: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return {
      id: hydrogenBottling.batch.id,
      emission,
      createdAt: hydrogenBottling.startedAt,
      amount: hydrogenBottling.batch.amount,
      batchType: BatchType.HYDROGEN,
      hydrogenComposition,
      unitId: hydrogenBottling.executedBy.id,
      color: hydrogenBottling.batch?.qualityDetails?.color,
      rfnboType: hydrogenBottling.batch?.qualityDetails?.rfnboType,
      processStep: hydrogenBottling.type,
      accountingPeriodEnd: hydrogenBottling.endedAt,
    };
  }
}
