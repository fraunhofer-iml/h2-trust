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
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { BatchType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { HydrogenStoragePosService } from '../proof-of-sustainability/hydrogen-storage-pos.service';
import { Util } from '../util';
import { ProofOfOriginAssembler } from './proof-of-origin-assembler.interface';

export class HydrogenStorageProofOfOriginService implements ProofOfOriginAssembler {
  public assembleSection(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
    if (!provenance || !provenance.getAllHydrogenLeafProductions()?.length) {
      return [];
    }
    const hydrogenProductions: ProcessStepEntity[] = provenance.getAllHydrogenLeafProductions();

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
          const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity[] =
            HydrogenStoragePosService.computeEmissionsForHydrogenStorage(hydrogenProduction);

          const emission: ProofOfOriginEmissionEntity =
            emissionCalculation.length > 0
              ? ProofOfOriginEmissionEntity.fromEmissionCalculation(
                  hydrogenProduction.batch.amount,
                  emissionCalculation[0].result,
                )
              : undefined;

          const batch: ProofOfOriginHydrogenBatchEntity = this.assembleHydrogenStorage(hydrogenProduction, emission);

          return batch;
        },
      );

      const classification: ProofOfOriginClassificationEntity = Util.assembleClassification(
        rfnboType,
        BatchType.HYDROGEN,
        batchesForHydrogenRfnboType,
        [],
      );

      classifications.push(classification);
    }

    return [new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_STORAGE_SECTION, [], classifications)];
  }

  private assembleHydrogenStorage(
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
