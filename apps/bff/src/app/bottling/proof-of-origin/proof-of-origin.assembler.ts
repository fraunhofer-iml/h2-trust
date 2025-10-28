/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { LineageContextEntity } from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenProductionSectionAssembler } from './assembler/hydrogen-production-section.assembler';
import { BottlingSectionService } from './sections/bottling-section.service';
import { InputMediaSectionService } from './sections/input-media-section.service';

@Injectable()
export class ProofOfOriginAssembler {
  constructor(
    private readonly bottlingSectionService: BottlingSectionService,
    private readonly inputMediaSectionService: InputMediaSectionService,
    private readonly hydrogenProductionSectionAssembler: HydrogenProductionSectionAssembler,
  ) {}

  async build(ctx: LineageContextEntity): Promise<SectionDto[]> {
    const sections: SectionDto[] = [];

    if (ctx.powerProductionProcessSteps?.length) {
      sections.push(
        await this.inputMediaSectionService.buildInputMediaSection(
          ctx.powerProductionProcessSteps,
          ctx.root.batch.amount,
        ),
      );
    }

    if (ctx.hydrogenProductionProcessSteps?.length) {
      sections.push(
        await this.hydrogenProductionSectionAssembler.buildHydrogenProductionSection(
          ctx.hydrogenProductionProcessSteps,
        ),
      );
    }

    if (ctx.root.type === ProcessType.HYDROGEN_BOTTLING || ctx.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      sections.push(
        await this.bottlingSectionService.buildBottlingSection(ctx.hydrogenBottlingProcessStep ?? ctx.root),
      );
    }

    if (ctx.root.type === ProcessType.HYDROGEN_TRANSPORTATION && ctx.hydrogenBottlingProcessStep) {
      sections.push(
        await this.bottlingSectionService.buildTransportationSection(ctx.root, ctx.hydrogenBottlingProcessStep),
      );
    }

    return sections;
  }
}
