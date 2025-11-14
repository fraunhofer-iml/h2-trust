/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProvenanceEntity } from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenBottlingSectionService } from './sections/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './sections/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './sections/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './sections/hydrogen-transportation-section.service';

@Injectable()
export class ProofOfOriginAssembler {
  constructor(
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly hydrogenStorageSectionAssembler: HydrogenStorageSectionService,
    private readonly hydrogenBottlingSectionService: HydrogenBottlingSectionService,
    private readonly hydrogenTransportationSectionService: HydrogenTransportationSectionService,
  ) { }

  async build(ctx: ProvenanceEntity): Promise<SectionDto[]> {
    const sections: SectionDto[] = [];

    if (ctx.powerProductions?.length || ctx.waterConsumptions?.length) {
      sections.push(
        await this.hydrogenProductionSectionService.buildHydrogenProductionSection(
          ctx.powerProductions,
          ctx.waterConsumptions,
        ),
      );
    }

    if (ctx.hydrogenProductions?.length) {
      sections.push(
        await this.hydrogenStorageSectionAssembler.buildHydrogenStorageSection(ctx.hydrogenProductions),
      );
    }

    if (ctx.root.type === ProcessType.HYDROGEN_BOTTLING || ctx.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      sections.push(
        await this.hydrogenBottlingSectionService.buildHydrogenBottlingSection(
          ctx.hydrogenBottling ?? ctx.root,
        ),
      );
    }

    if (ctx.root.type === ProcessType.HYDROGEN_TRANSPORTATION && ctx.hydrogenBottling) {
      sections.push(
        await this.hydrogenTransportationSectionService.buildHydrogenTransportationSection(
          ctx.root,
          ctx.hydrogenBottling,
        ),
      );
    }

    return sections;
  }
}
