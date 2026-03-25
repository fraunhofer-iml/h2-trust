/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProofOfOriginBatchEntity,
  ProofOfOriginClassificationEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { BatchType, ProcessType, ProofOfOrigin, RfnboType } from '@h2-trust/domain';
import { HydrogenComponentAssembler } from '../../process-step/hydrogenComponent/hydrogen-component.assembler';
import { HydrogenBottlingEmissionService } from './emission-services/hydrogen-bottling-emission.service';
import { HydrogenProductionEmissionService } from './emission-services/hydrogen-production-emission.service';
import { HydrogenTransportEmissionService } from './emission-services/hydrogen-transport-emission.service';
import { HydrogenProductionSectionService } from './hydrogen-production-section.service';

@Injectable()
export class ProofOfOriginService {
  constructor(private readonly hydrogenProductionSectionService: HydrogenProductionSectionService) {}
  public createProofOfSustainability(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
    const proofOfOrigin: ProofOfOriginSectionEntity[] = [];

    const hydrogenCompositionsForRootOfProvenance: HydrogenComponentEntity[] =
      HydrogenComponentAssembler.assemble(provenance);

    //If the process step is neither hydrogen bottling nor transport, then proof of origin should not be calculated.
    if (
      provenance.root.type == ProcessType.HYDROGEN_BOTTLING ||
      provenance.root.type == ProcessType.HYDROGEN_TRANSPORTATION
    ) {
      //build hydrogen production section
      if (provenance.powerProductions?.length || provenance.waterConsumptions?.length) {
        const hydrogenProductionSection: ProofOfOriginSectionEntity =
          this.hydrogenProductionSectionService.buildSection(
            provenance.powerProductions,
            provenance.waterConsumptions,
            provenance.hydrogenBottling.batch.amount,
          );
        proofOfOrigin.push(hydrogenProductionSection);
      }

      //build storage section
      if (provenance.hydrogenProductions?.length) {
        const hydrogenStorageSection: ProofOfOriginSectionEntity = this.assembleHydrogenStorageSection(
          provenance.hydrogenProductions,
        );
        proofOfOrigin.push(hydrogenStorageSection);
      }

      //build bottling section for rootType=HYDROGEN_BOTTLING
      if (provenance.root.type === ProcessType.HYDROGEN_BOTTLING) {
        const hydrogenBottlingSection: ProofOfOriginSectionEntity = this.assembleHydrogenBottlingSection(
          provenance.root,
          hydrogenCompositionsForRootOfProvenance,
        );
        proofOfOrigin.push(hydrogenBottlingSection);
      }

      //build bottling section for rootType=HYDROGEN_TRANSPORTATION
      if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
        const hydrogenBottlingSection: ProofOfOriginSectionEntity = this.assembleHydrogenBottlingSection(
          provenance.hydrogenBottling,
          hydrogenCompositionsForRootOfProvenance,
        );
        proofOfOrigin.push(hydrogenBottlingSection);
      }

      //build transport section for rootType=HYDROGEN_TRANSPORTATION
      if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION && provenance.hydrogenBottling) {
        const hydrogenTransportationSection: ProofOfOriginSectionEntity = this.assembleHydrogenTransportationSection(
          provenance.root,
          hydrogenCompositionsForRootOfProvenance,
        );
        proofOfOrigin.push(hydrogenTransportationSection);
      }
    }
    return proofOfOrigin;
  }

  private assembleHydrogenBottlingSection(
    hydrogenBottling: ProcessStepEntity,
    hydrogenComposition: HydrogenComponentEntity[],
  ): ProofOfOriginSectionEntity {
    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      HydrogenBottlingEmissionService.assembleHydrogenBottling(hydrogenBottling);

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

  private assembleHydrogenStorageSection(hydrogenProductions: ProcessStepEntity[]): ProofOfOriginSectionEntity {
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
            HydrogenProductionEmissionService.assembleHydrogenStorage(hydrogenProduction);

          const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
            hydrogenProduction.batch.amount,
            emissionCalculation.result,
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

  private assembleHydrogenTransportationSection(
    hydrogenTransportation: ProcessStepEntity,
    hydrogenCompositions: HydrogenComponentEntity[],
  ): ProofOfOriginSectionEntity {
    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      HydrogenTransportEmissionService.assembleHydrogenTransportation(hydrogenTransportation);

    const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
      hydrogenTransportation.batch.amount,
      emissionCalculation.result,
    );

    const batch: ProofOfOriginHydrogenBatchEntity = this.assembleHydrogenTransportation(
      hydrogenTransportation,
      hydrogenCompositions,
      emission,
    );

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION, [batch], []);
  }

  private assembleHydrogenTransportation(
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
