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
import { ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { BatchAssembler } from './batch.assembler';
import { ClassificationAssembler } from './classification.assembler';
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

          const batch: ProofOfOriginHydrogenBatchEntity = BatchAssembler.assembleHydrogenStorage(
            hydrogenProduction,
            emission,
          );

          return batch;
        },
      );

      const classification: ProofOfOriginClassificationEntity = ClassificationAssembler.assembleHydrogen(
        rfnboType,
        batchesForHydrogenRfnboType,
      );

      classifications.push(classification);
    }

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], classifications);
  }
}
