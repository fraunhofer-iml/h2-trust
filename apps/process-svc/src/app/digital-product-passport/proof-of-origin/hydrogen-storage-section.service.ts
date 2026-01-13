/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  ProofOfOriginHydrogenBatchEntity,
  ProcessStepEntity,
  ProofOfOriginBatchEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { HydrogenColor, ProofOfOrigin } from '@h2-trust/domain';
import { BatchAssembler } from './batch.assembler';
import { ClassificationAssembler } from './classification.assembler';
import { EmissionAssembler } from './emission.assembler';

@Injectable()
export class HydrogenStorageSectionService {
  async buildSection(hydrogenProductions: ProcessStepEntity[]): Promise<ProofOfOriginSectionEntity> {
    if (!hydrogenProductions?.length) {
      return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], []);
    }

    const classifications: ProofOfOriginClassificationEntity[] = [];

    for (const hydrogenColor of Object.values(HydrogenColor)) {
      const hydrogenProductionsByHydrogenColor = hydrogenProductions
        .filter((hp) => hp.batch?.qualityDetails?.color === hydrogenColor);

      if (hydrogenProductionsByHydrogenColor.length === 0) {
        continue;
      }

      const batchesForHydrogenColor: ProofOfOriginBatchEntity[] = await Promise.all(
        hydrogenProductionsByHydrogenColor.map(async (hydrogenProduction) => {
          const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
            EmissionAssembler.assembleHydrogenStorage(hydrogenProduction);

          const emission: ProofOfOriginEmissionEntity =
            EmissionAssembler.assembleEmissionDto(
              emissionCalculation,
              hydrogenProduction.batch.amount,
            );

          const batch: ProofOfOriginHydrogenBatchEntity =
            BatchAssembler.assembleHydrogenStorage(
              hydrogenProduction,
              emission
            );

          return batch;
        }),
      );

      const classification: ProofOfOriginClassificationEntity =
        ClassificationAssembler.assembleHydrogen(
          hydrogenColor,
          batchesForHydrogenColor,
        );

      classifications.push(classification);
    }

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], classifications);
  }
}
