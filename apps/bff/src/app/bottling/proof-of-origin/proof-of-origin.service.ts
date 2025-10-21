/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenProductionSectionAssembler } from './assembler/hydrogen-production-section.assembler';
import { invalidProcessType } from './proof-of-origin.validation';
import { ProcessLineageService } from './retrieval/process-lineage.service';
import { ProcessStepService } from './retrieval/process-step.service';
import { BottlingSectionService } from './sections/bottling-section.service';
import { InputMediaSectionService } from './sections/input-media-section.service';

@Injectable()
export class ProofOfOriginService {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly processLineageService: ProcessLineageService,
    private readonly bottlingSectionService: BottlingSectionService,
    private readonly inputMediaSectionService: InputMediaSectionService,
  ) {}

  async readProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    const processStep: ProcessStepEntity = await this.processStepService.fetchProcessStep(processStepId);

    switch (processStep.type) {
      case ProcessType.POWER_PRODUCTION:
        return this.buildPowerProductionSections(processStep);

      case ProcessType.HYDROGEN_PRODUCTION:
        return this.buildHydrogenProductionSections(processStep);

      case ProcessType.HYDROGEN_BOTTLING:
        return this.buildHydrogenBottlingSections(processStep);

      case ProcessType.HYDROGEN_TRANSPORTATION:
        return this.buildHydrogenTransportationSections(processStep);

      default:
        throw invalidProcessType(processStep.id, processStep.type);
    }
  }

  private async buildPowerProductionSections(powerProductionProcessStep: ProcessStepEntity): Promise<SectionDto[]> {
    const inputMediaSection: SectionDto = await this.inputMediaSectionService.buildInputMediaSection([
      powerProductionProcessStep,
    ]);
    return [inputMediaSection];
  }

  private async buildHydrogenProductionSections(
    hydrogenProductionProcessStep: ProcessStepEntity,
  ): Promise<SectionDto[]> {
    const powerProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchPowerProductionProcessSteps([hydrogenProductionProcessStep]);

    const inputMediaSection: SectionDto =
      await this.inputMediaSectionService.buildInputMediaSection(powerProductionProcessSteps);
    const hydrogenProductionSection: SectionDto = HydrogenProductionSectionAssembler.buildHydrogenProductionSection([
      hydrogenProductionProcessStep,
    ]);

    return [inputMediaSection, hydrogenProductionSection];
  }

  private async buildHydrogenBottlingSections(hydrogenBottlingProcessStep: ProcessStepEntity): Promise<SectionDto[]> {
    const hydrogenProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchHydrogenProductionProcessSteps(hydrogenBottlingProcessStep);
    const powerProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchPowerProductionProcessSteps(hydrogenProductionProcessSteps);

    const [inputMediaSection, bottlingSection]: [SectionDto, SectionDto] = await Promise.all([
      this.inputMediaSectionService.buildInputMediaSection(powerProductionProcessSteps),
      this.bottlingSectionService.buildBottlingSection(hydrogenBottlingProcessStep),
    ]);
    const hydrogenProductionSection: SectionDto =
      HydrogenProductionSectionAssembler.buildHydrogenProductionSection(hydrogenProductionProcessSteps);

    return [inputMediaSection, hydrogenProductionSection, bottlingSection];
  }

  private async buildHydrogenTransportationSections(
    hydrogenTransportationProcessStep: ProcessStepEntity,
  ): Promise<SectionDto[]> {
    const hydrogenBottlingProcessStep: ProcessStepEntity =
      await this.processLineageService.fetchHydrogenBottlingProcessStep(hydrogenTransportationProcessStep);
    const hydrogenProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchHydrogenProductionProcessSteps(hydrogenBottlingProcessStep);
    const powerProductionProcessSteps: ProcessStepEntity[] =
      await this.processLineageService.fetchPowerProductionProcessSteps(hydrogenProductionProcessSteps);

    const [inputMediaSection, bottlingSection, transportationSection]: [SectionDto, SectionDto, SectionDto] =
      await Promise.all([
        this.inputMediaSectionService.buildInputMediaSection(powerProductionProcessSteps),
        this.bottlingSectionService.buildBottlingSection(hydrogenBottlingProcessStep),
        this.bottlingSectionService.buildTransportationSection(
          hydrogenTransportationProcessStep,
          hydrogenBottlingProcessStep,
        ),
      ]);
    const hydrogenProductionSection: SectionDto =
      HydrogenProductionSectionAssembler.buildHydrogenProductionSection(hydrogenProductionProcessSteps);

    return [inputMediaSection, hydrogenProductionSection, bottlingSection, transportationSection];
  }
}
