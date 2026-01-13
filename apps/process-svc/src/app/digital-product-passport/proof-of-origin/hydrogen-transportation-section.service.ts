/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  HydrogenBatch,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProofOfOriginEmissionEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionCalculationEntity,
} from '@h2-trust/amqp';
import { ProofOfOrigin } from '@h2-trust/domain';
import { BottlingService } from '../../process-step/bottling/bottling.service';
import { BatchAssembler } from './batch.assembler';
import { EmissionAssembler } from './emission.assembler';

@Injectable()
export class HydrogenTransportationSectionService {
  constructor(private readonly bottlingService: BottlingService) {}

  async buildSection(
    hydrogenTransportation: ProcessStepEntity,
    hydrogenBottling: ProcessStepEntity,
  ): Promise<ProofOfOriginSectionEntity> {
    const hydrogenCompositions: HydrogenComponentEntity[] =
      await this.bottlingService.calculateHydrogenComposition(hydrogenBottling);

    const emissionCalculation: ProofOfSustainabilityEmissionCalculationEntity =
      EmissionAssembler.assembleHydrogenTransportation(hydrogenTransportation);
    const hydrogenKgEquivalent: number = hydrogenTransportation.batch.amount;

    const emission: ProofOfOriginEmissionEntity = EmissionAssembler.assembleEmissionDto(
      emissionCalculation,
      hydrogenKgEquivalent,
    );

    const batch: HydrogenBatch = BatchAssembler.assembleHydrogenTransportation(
      hydrogenTransportation,
      hydrogenCompositions,
      emission,
    );

    return new ProofOfOriginSectionEntity(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION, [batch], []);
  }
}
