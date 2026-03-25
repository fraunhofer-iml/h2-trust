/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfOriginBatchEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { EmissionAssembler } from './emission.assembler';

export class HydrogenStorageSectionAssembler {
  static assembleSection(hydrogenProductions: ProcessStepEntity[]): ProofOfOriginSectionEntity {
    if (!hydrogenProductions?.length) {
      return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], []);
    }

    const classifications: ProofOfOriginClassificationEntity[] = [];

    for (const rfnboType of Object.values(RfnboType)) {
      const hydrogenProductionsByRfnboType = hydrogenProductions.filter(
        (hp) => hp.batch?.qualityDetails?.rfnboType === rfnboType,
      );

      if (hydrogenProductionsByRfnboType.length === 0) {
        continue;
      }

      const batchesForHydrogenRfnboType: ProofOfOriginBatchEntity[] = hydrogenProductionsByRfnboType.map(
        (hydrogenProduction) => {
          const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
            EmissionAssembler.assembleHydrogenStorage(hydrogenProduction);

          const emission: ProofOfOriginEmissionEntity = EmissionAssembler.assembleEmissionEntity(
            emissionCalculation,
            hydrogenProduction.batch.amount,
          );

          const batch: ProofOfOriginHydrogenBatchEntity = this.assembleHydrogenStorage(hydrogenProduction, emission);

          return batch;
        },
      );

      const classification: ProofOfOriginClassificationEntity = ProofOfOriginClassificationEntity.assemble(
        rfnboType,
        BatchType.HYDROGEN,
        batchesForHydrogenRfnboType,
        [],
      );

      classifications.push(classification);
    }

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], classifications);
  }

  static assembleHydrogenStorage(
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
          color: hydrogenStorage.batch?.qualityDetails?.color,
          amount: hydrogenStorage.batch.amount,
          rfnboType: hydrogenStorage.batch?.qualityDetails?.rfnboType,
        },
      ],
      producer: hydrogenStorage.batch.owner?.name,
      unitId: hydrogenStorage.executedBy.id,
      color: hydrogenStorage.batch?.qualityDetails?.color,
      rfnboType: hydrogenStorage.batch?.qualityDetails?.rfnboType,
      processStep: hydrogenStorage.type,
      accountingPeriodEnd: hydrogenStorage.endedAt,
    };
  }
}
