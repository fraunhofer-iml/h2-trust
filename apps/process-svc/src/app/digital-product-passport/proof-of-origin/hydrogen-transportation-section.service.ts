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
  ReadByIdPayload,
} from '@h2-trust/amqp';
import { EmissionCalculationDto, EmissionDto, HydrogenBatchDto, SectionDto } from '@h2-trust/api';
import { ProofOfOrigin } from '@h2-trust/domain';
import { EmissionCalculationAssembler } from './emission.assembler';
import { BatchAssembler } from './batch.assembler';
import { BottlingService } from '../../process-step/bottling/bottling.service';

@Injectable()
export class HydrogenTransportationSectionService {
  constructor(private readonly bottlingService: BottlingService) { }

  async buildSection(
    hydrogenTransportation: ProcessStepEntity,
    hydrogenBottling: ProcessStepEntity,
  ): Promise<SectionDto> {
    const hydrogenCompositions: HydrogenComponentEntity[] = await this.bottlingService.calculateHydrogenComposition(new ReadByIdPayload(hydrogenBottling.id));

    const emissionCalculation: EmissionCalculationDto =
      EmissionCalculationAssembler.assembleHydrogenTransportationCalculation(hydrogenTransportation);
    const hydrogenKgEquivalent: number = hydrogenTransportation.batch.amount;

    const emission: EmissionDto = EmissionCalculationAssembler.assembleEmissionDto(
      emissionCalculation,
      hydrogenKgEquivalent,
    );

    const batch: HydrogenBatchDto = BatchAssembler.assembleHydrogenTransportationBatchDto(
      hydrogenTransportation,
      hydrogenCompositions,
      emission,
    );

    return new SectionDto(ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION, [batch], []);
  }
}
