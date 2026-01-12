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
import {
  BrokerQueues,
  DigitalProductPassportGeneralInformationEntity,
  DocumentEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEmissionComputationEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  ReadByIdPayload,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import { BottlingService } from '../process-step/bottling/bottling.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { EmissionService } from './proof-of-origin/emission.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProvenanceService } from './provenance/provenance.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly emissionService: EmissionService,
    private readonly provenanceService: ProvenanceService,
    private readonly redComplianceService: RedComplianceService,
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
    private readonly proofOfOriginService: ProofOfOriginService,
  ) {}

  async readGeneralInformation(processStepId: string): Promise<DigitalProductPassportGeneralInformationEntity> {
    const processStep = await this.processStepService.readProcessStep(processStepId);

    const [producerName, hydrogenComposition, redCompliance] = await Promise.all([
      firstValueFrom(
        this.generalSvc.send(UserMessagePatterns.READ, new ReadByIdPayload(processStep.recordedBy?.id)),
      ).then((user) => user.company.name),
      this.bottlingService.calculateHydrogenComposition(processStep),
      this.redComplianceService.determineRedCompliance(processStepId),
    ]);

    const attachedFiles: DocumentEntity[] = processStep.documents ?? [];

    return new DigitalProductPassportGeneralInformationEntity(
      processStep.id,
      processStep.endedAt,
      processStep.batch?.owner?.name,
      processStep.batch?.amount,
      processStep.batch?.qualityDetails?.color,
      producerName,
      hydrogenComposition,
      attachedFiles,
      redCompliance,
    );
  }

  async readProofOfOrigin(processStepId: string): Promise<ProofOfOriginSectionEntity[]> {
    return this.proofOfOriginService.readProofOfOrigin(processStepId);
  }

  async readProofOfSustainability(processStepId: string): Promise<ProofOfSustainabilityEntity> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStepId);

    const provenanceEmission: ProofOfSustainabilityEmissionComputationEntity =
      await this.emissionService.computeProvenanceEmissions(provenance);

    return new ProofOfSustainabilityEntity(
      provenance.root.id,
      provenanceEmission.amountCO2PerMJH2,
      provenanceEmission.emissionReductionPercentage,
      provenanceEmission.calculations,
      provenanceEmission.processStepEmissions,
    );
  }
}
