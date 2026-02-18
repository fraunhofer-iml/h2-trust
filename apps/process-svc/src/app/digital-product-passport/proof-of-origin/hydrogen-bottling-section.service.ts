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
  ProofOfOriginEmissionEntity,
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { ProofOfOrigin } from '@h2-trust/domain';
import { BatchAssembler } from './batch.assembler';
import { EmissionAssembler } from './emission.assembler';

@Injectable()
export class HydrogenBottlingSectionService {
  constructor() {}

  static buildSection(
    hydrogenBottling: ProcessStepEntity,
    hydrogenCompositions: HydrogenComponentEntity[],
  ): ProofOfOriginSectionEntity {
    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      EmissionAssembler.assembleHydrogenBottling(hydrogenBottling);

    const emission: ProofOfOriginEmissionEntity = EmissionAssembler.assembleEmissionEntity(
      emissionCalculation,
      hydrogenBottling.batch.amount,
    );

    const batch: ProofOfOriginHydrogenBatchEntity = BatchAssembler.assembleHydrogenBottling(
      hydrogenBottling,
      hydrogenCompositions,
      emission,
    );

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_BOTTLING_SECTION, [batch], []);
  }
}
