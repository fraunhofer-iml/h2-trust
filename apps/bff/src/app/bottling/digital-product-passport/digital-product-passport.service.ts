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
import { BrokerQueues, HydrogenComponentEntity, ProcessStepMessagePatterns, ProvenanceEntity, ProvenanceMessagePatterns, ReadByIdPayload, RedComplianceMessagePatterns } from '@h2-trust/amqp';
import { EmissionComputationResultDto, GeneralInformationDto, HydrogenComponentDto, ProofOfSustainabilityDto, SectionDto } from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { EmissionComputationService } from './emission-computation.service';
import { HydrogenBottlingSectionService } from './proof-of-origin/hydrogen-bottling-section.service';
import { HydrogenProductionSectionService } from './proof-of-origin/hydrogen-production-section.service';
import { HydrogenStorageSectionService } from './proof-of-origin/hydrogen-storage-section.service';
import { HydrogenTransportationSectionService } from './proof-of-origin/hydrogen-transportation-section.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
    private readonly hydrogenProductionSectionService: HydrogenProductionSectionService,
    private readonly hydrogenStorageSectionService: HydrogenStorageSectionService,
    private readonly hydrogenBottlingSectionService: HydrogenBottlingSectionService,
    private readonly hydrogenTransportationSectionService: HydrogenTransportationSectionService,
    private readonly emissionComputationService: EmissionComputationService,
  ) { }

  async readGeneralInformation(processStepId: string): Promise<GeneralInformationDto> {
    const processStep = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.READ_UNIQUE, new ReadByIdPayload(processStepId)),
    );

    const generalInformation = GeneralInformationDto.fromEntityToDto(processStep);

    const [producerName, hydrogenComposition, redCompliance] = await Promise.all([
      this.userService.readUserWithCompany(generalInformation.producer).then((user) => user.company.name),
      this.fetchHydrogenComposition(processStep.id),
      firstValueFrom(this.processSvc.send(RedComplianceMessagePatterns.DETERMINE, new ReadByIdPayload(processStepId))),
    ]);

    return {
      ...generalInformation,
      producer: producerName,
      hydrogenComposition,
      redCompliance,
    };
  }

  private async fetchHydrogenComposition(processStepId: string): Promise<HydrogenComponentDto[]> {
    const hydrogenComposition: HydrogenComponentEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION, new ReadByIdPayload(processStepId)),
    );

    return hydrogenComposition.map(HydrogenComponentDto.of);
  }

  async buildProofOfOrigin(processStepId: string): Promise<SectionDto[]> {
    const provenance: ProvenanceEntity = await firstValueFrom(
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, new ReadByIdPayload(processStepId)),
    );
    const sectionPromises: Array<Promise<SectionDto>> = [];

    const hydrogenProductionPromise =
      provenance.powerProductions?.length || provenance.waterConsumptions?.length
        ? this.hydrogenProductionSectionService.buildSection(
          provenance.powerProductions,
          provenance.waterConsumptions,
          provenance.hydrogenBottling.batch.amount,
        )
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
      this.processSvc.send(ProvenanceMessagePatterns.BUILD_PROVENANCE, new ReadByIdPayload(processStepId)),
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
