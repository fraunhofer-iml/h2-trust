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
import { EmissionComputationResultDto, ProofOfSustainabilityDto, SectionDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { EmissionComputationService } from './emission-computation.service';
import { HydrogenBottlingSectionService } from './section/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './section/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './section/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './section/hydrogen-transportation-section.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly hydrogenStorageSectionService: HydrogenStorageSectionService,
    private readonly hydrogenBottlingSectionService: HydrogenBottlingSectionService,
    private readonly hydrogenTransportationSectionService: HydrogenTransportationSectionService,
    private readonly emissionComputationService: EmissionComputationService,
  ) {}

  async buildProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    const provenance: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, { processStepId }),
    );
    const sectionPromises: Array<Promise<SectionDto>> = [];

    const hydrogenProductionPromise =
      provenance.powerProductions?.length || provenance.waterConsumptions?.length
        ? this.hydrogenProductionSectionService.buildSection(provenance.powerProductions, provenance.waterConsumptions)
        : Promise.resolve(undefined);

    const hydrogenStoragePromise = provenance.hydrogenProductions?.length
      ? this.hydrogenStorageSectionService.buildSection(provenance.hydrogenProductions)
      : Promise.resolve(undefined);

    const hydrogenBottlingPromise =
      provenance.root.type === ProcessType.HYDROGEN_BOTTLING ||
      provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION
        ? this.hydrogenBottlingSectionService.buildSection(provenance.hydrogenBottling ?? provenance.root)
        : Promise.resolve(undefined);

    const hydrogenTransportationPromise =
      provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION && provenance.hydrogenBottling
        ? this.hydrogenTransportationSectionService.buildSection(provenance.root, provenance.hydrogenBottling)
        : Promise.resolve(undefined);

    sectionPromises.push(
      hydrogenProductionPromise,
      hydrogenStoragePromise,
      hydrogenBottlingPromise,
      hydrogenTransportationPromise,
    );

    const sections = await Promise.all(sectionPromises);
    return sections.filter((section) => section !== undefined);
  }

  async buildProofOfSustainability(processStepId: string): Promise<ProofOfSustainabilityDto> {
    const provenance: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, { processStepId }),
    );
    const provenanceEmission: EmissionComputationResultDto =
      await this.emissionComputationService.computeProvenanceEmissions(provenance);
    return new ProofOfSustainabilityDto(
      provenance.root.id,
      provenanceEmission.amountCO2PerMJH2,
      provenanceEmission.emissionReductionPercentage,
      provenanceEmission.calculations,
      provenanceEmission.processStepEmissions,
    );
  }
}
