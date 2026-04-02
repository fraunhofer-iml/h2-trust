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
import { HydrogenTransportPosService } from '../proof-of-sustainability/hydrogen-transport-pos.service';

export class HydrogenTransportationProofOfOriginService {
  public static assembleHydrogenTransportationSection(
    hydrogenTransportation: ProcessStepEntity,
    hydrogenCompositions: HydrogenComponentEntity[],
  ): ProofOfOriginSectionEntity {
    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      HydrogenTransportPosService.assembleHydrogenTransportation(hydrogenTransportation);

    const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
      hydrogenTransportation.batch.amount,
      emissionCalculation.result,
      emissionCalculation.basisOfCalculation,
    );

    const batch: ProofOfOriginHydrogenBatchEntity = this.assembleHydrogenTransportation(
      hydrogenTransportation,
      hydrogenCompositions,
      emission,
    );

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION, [batch], []);
  }

  private static assembleHydrogenTransportation(
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
      hydrogenComposition,
      unitId: hydrogenTransportation.executedBy.id,
      color: hydrogenTransportation.batch?.qualityDetails?.color,
      rfnboType: hydrogenTransportation.batch?.qualityDetails?.rfnboType,
      processStep: hydrogenTransportation.type,
      accountingPeriodEnd: hydrogenTransportation.endedAt,
    };
  }
}
