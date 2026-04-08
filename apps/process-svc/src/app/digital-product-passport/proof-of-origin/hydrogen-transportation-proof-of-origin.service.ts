/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProcessStepEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { BatchType, ProcessType, ProofOfOrigin } from '@h2-trust/domain';
import { HydrogenTransportPosService } from '../proof-of-sustainability/hydrogen-transport-pos.service';
import { ProofOfOriginAssembler } from './proof-of-origin-assembler.interface';

export class HydrogenTransportationProofOfOriginService implements ProofOfOriginAssembler {
  private hydrogenTransportPosService: HydrogenTransportPosService = new HydrogenTransportPosService();
  public assembleSection(provenance: ProvenanceEntity): ProofOfOriginSectionEntity[] {
    if (provenance.root.type !== ProcessType.HYDROGEN_TRANSPORTATION) {
      return [];
    }
    const hydrogenTransportation: ProcessStepEntity = provenance.root;
    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      this.hydrogenTransportPosService.assembleHydrogenTransportation(hydrogenTransportation);

    const emission: ProofOfOriginEmissionEntity = ProofOfOriginEmissionEntity.fromEmissionCalculation(
      hydrogenTransportation.batch.amount,
      emissionCalculation.result,
      emissionCalculation.basisOfCalculation,
    );

    const batch: ProofOfOriginHydrogenBatchEntity = this.assembleHydrogenTransportation(
      hydrogenTransportation,
      emission,
    );

    return [new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION, [batch], [])];
  }

  private assembleHydrogenTransportation(
    hydrogenTransportation: ProcessStepEntity,
    emission?: ProofOfOriginEmissionEntity,
  ): ProofOfOriginHydrogenBatchEntity {
    return {
      id: hydrogenTransportation.batch.id,
      emission,
      createdAt: hydrogenTransportation.startedAt,
      amount: hydrogenTransportation.batch.amount,
      batchType: BatchType.HYDROGEN,
      hydrogenComposition: [],
      unitId: hydrogenTransportation.executedBy.id,
      color: hydrogenTransportation.batch?.qualityDetails?.color,
      rfnboType: hydrogenTransportation.batch?.qualityDetails?.rfnboType,
      processStep: hydrogenTransportation.type,
      accountingPeriodEnd: hydrogenTransportation.endedAt,
    };
  }
}
