/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  DigitalProductPassportEntity,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import { PowerType, RfnboType } from '@h2-trust/domain';
import { HydrogenComponentAssembler } from '../process-step/hydrogenComponent/hydrogen-component.assembler';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from './proof-of-origin/proof-of-sustainability.service';
import { ProvenanceService } from './provenance/provenance.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class DigitalProductPassportService {
  private readonly logger = new Logger(DigitalProductPassportService.name);
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly redComplianceService: RedComplianceService,
    private readonly proofOfOriginService: ProofOfOriginService,
    private readonly provenanceService: ProvenanceService,
    private readonly emissionService: ProofOfSustainabilityService,
  ) {}

  async determineRfnboTypeForProcessStepId(processStepId: string): Promise<RfnboType> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    return this.determineRfnboTypeForProcessStep(processStep);
  }

  async determineRfnboTypeForProcessStep(processStep: ProcessStepEntity): Promise<RfnboType> {
    const dpp: DigitalProductPassportEntity = await this.readDigitalProductPassport(processStep);
    return dpp.rfnboType ? RfnboType.RFNBO_READY : RfnboType.NON_CERTIFIABLE;
  }

  async readDigitalProductPassportForProcessStepId(processStepId: string): Promise<DigitalProductPassportEntity> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    return this.readDigitalProductPassport(processStep);
  }

  async updateRfnboStatus(processStep: ProcessStepEntity): Promise<{ id: string; batchId: string }> {
    const dpp: DigitalProductPassportEntity = await this.readDigitalProductPassport(processStep);
    this.logger.debug(`Set RFNBO status of process step ${processStep.id} to ${dpp.rfnboType}`);
    return this.processStepService.updateRfnboStatus(processStep, dpp.rfnboType);
  }

  private async readDigitalProductPassport(processStep: ProcessStepEntity): Promise<DigitalProductPassportEntity> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStep);
    const redCompliance: RedComplianceEntity = this.redComplianceService.determineRedCompliance(provenance);
    const powerType: PowerType = DigitalProductPassportService.getPowerType(provenance);

    const proofOfOrigin: ProofOfOriginSectionEntity[] =
      this.proofOfOriginService.createProofOfSustainability(provenance);

    const hydrogenCompositionsForRootOfProvenance: HydrogenComponentEntity[] =
      HydrogenComponentAssembler.assemble(provenance);

    const proofOfSustainability: ProofOfSustainabilityEntity =
      this.emissionService.createProofOfSustainability(provenance);

    return new DigitalProductPassportEntity(
      processStep.id,
      processStep.endedAt,
      processStep.batch.owner.name ?? '',
      processStep.batch.amount ?? 0,
      processStep.batch.qualityDetails.color ?? '',
      processStep.recordedBy.company.name ?? '',
      hydrogenCompositionsForRootOfProvenance,
      processStep.documents ?? [],
      redCompliance,
      proofOfSustainability,
      proofOfOrigin,
      powerType,
    );
  }

  private static getPowerType(provenance: ProvenanceEntity): PowerType {
    let powerType = PowerType.RENEWABLE;
    const hasRenewableGridPower = provenance.powerProductions.some(
      (pp) => pp.batch?.qualityDetails?.powerType == PowerType.PARTLY_RENEWABLE,
    );
    if (hasRenewableGridPower) {
      powerType = PowerType.PARTLY_RENEWABLE;
    }
    const hasNotRenewableGrid = provenance.powerProductions.some(
      (pp) => pp.batch?.qualityDetails?.powerType == PowerType.NON_RENEWABLE,
    );
    if (hasNotRenewableGrid) {
      powerType = PowerType.NON_RENEWABLE;
    }
    return powerType;
  }
}
