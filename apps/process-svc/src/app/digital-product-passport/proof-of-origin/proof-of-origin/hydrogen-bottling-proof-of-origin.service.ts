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
import { HydrogenBottlingPosService } from '../proof-of-sustainability/hydrogen-bottling-pos.service';

export class HydrogenBottlingProofOfOriginService {
  public static assembleHydrogenBottlingSection(
    hydrogenBottling: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
  ): ProofOfOriginSectionEntity {
    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      HydrogenBottlingPosService.assembleHydrogenBottling(hydrogenBottling);

    const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
      hydrogenBottling.batch.amount,
      emissionCalculation.result,
    );

    const batch: ProofOfOriginHydrogenBatchEntity = {
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

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION, [batch], []);
  }
}
