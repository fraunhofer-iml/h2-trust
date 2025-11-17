/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, ProvenanceEntity, ProvenanceMessagePatterns } from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { HydrogenBottlingSectionService } from './sections/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './sections/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './sections/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './sections/hydrogen-transportation-section.service';

@Injectable()
export class ProofOfOriginService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly hydrogenStorageSectionAssembler: HydrogenStorageSectionService,
    private readonly hydrogenBottlingSectionService: HydrogenBottlingSectionService,
    private readonly hydrogenTransportationSectionService: HydrogenTransportationSectionService,
  ) { }

  async readProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    const provenance = await firstValueFrom(this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, { processStepId }));
    return this.buildSections(provenance);
  }

  private async buildSections(provenance: ProvenanceEntity): Promise<SectionDto[]> {
    const sections: SectionDto[] = [];

    if (provenance.powerProductions?.length || provenance.waterConsumptions?.length) {
      sections.push(
        await this.hydrogenProductionSectionService.buildHydrogenProductionSection(
          provenance.powerProductions,
          provenance.waterConsumptions,
        ),
      );
    }

    if (provenance.hydrogenProductions?.length) {
      sections.push(
        await this.hydrogenStorageSectionAssembler.buildHydrogenStorageSection(provenance.hydrogenProductions),
      );
    }

    if (provenance.root.type === ProcessType.HYDROGEN_BOTTLING || provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION) {
      sections.push(
        await this.hydrogenBottlingSectionService.buildHydrogenBottlingSection(
          provenance.hydrogenBottling ?? provenance.root,
        ),
      );
    }

    if (provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION && provenance.hydrogenBottling) {
      sections.push(
        await this.hydrogenTransportationSectionService.buildHydrogenTransportationSection(
          provenance.root,
          provenance.hydrogenBottling,
        ),
      );
    }

    return sections;
  }
}
