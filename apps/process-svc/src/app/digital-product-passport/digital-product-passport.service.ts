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
import { BrokerQueues, ProvenanceEntity, ReadByIdPayload, UserMessagePatterns } from '@h2-trust/amqp';
import {
  EmissionComputationResultDto,
  GeneralInformationDto,
  HydrogenComponentDto,
  ProofOfSustainabilityDto,
  SectionDto,
} from '@h2-trust/api';
import { BottlingService } from '../process-step/bottling/bottling.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { EmissionComputationService } from './proof-of-origin/emission-computation.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProvenanceService } from './provenance/provenance.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly emissionComputationService: EmissionComputationService,
    private readonly provenanceService: ProvenanceService,
    private readonly redComplianceService: RedComplianceService,
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
    private readonly proofOfOriginService: ProofOfOriginService,
  ) {}

  async readGeneralInformation(payload: ReadByIdPayload): Promise<GeneralInformationDto> {
    const processStep = await this.processStepService.readProcessStep(payload);

    const generalInformation = GeneralInformationDto.fromEntityToDto(processStep);

    const [producerName, hydrogenComposition, redCompliance] = await Promise.all([
      firstValueFrom(
        this.generalSvc.send(UserMessagePatterns.READ, new ReadByIdPayload(generalInformation.producer)),
      ).then((user) => user.company.name),
      this.bottlingService
        .calculateHydrogenComposition(payload)
        .then((hydrogenCompositions) => hydrogenCompositions.map(HydrogenComponentDto.of)),
      this.redComplianceService.determineRedCompliance(payload),
    ]);

    return {
      ...generalInformation,
      producer: producerName,
      hydrogenComposition,
      redCompliance,
    };
  }

  async buildProofOfOrigin(payload: ReadByIdPayload): Promise<SectionDto[]> {
    return this.proofOfOriginService.buildProofOfOrigin(payload);
  }

  async buildProofOfSustainability(payload: ReadByIdPayload): Promise<ProofOfSustainabilityDto> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(payload);

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
