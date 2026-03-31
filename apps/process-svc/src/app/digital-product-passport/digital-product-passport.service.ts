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
  RootProductionEntity,
} from '@h2-trust/amqp';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
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

  async readDigitalProductPassportForProcessStepId(processStepId: string): Promise<DigitalProductPassportEntity> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);
    return this.readDigitalProductPassport(processStep);
  }

  async updateRfnboStatus(processStep: ProcessStepEntity): Promise<{ id: string; batchId: string }> {
    const dpp: DigitalProductPassportEntity = await this.readDigitalProductPassport(processStep);
    this.logger.debug(`Set RFNBO status of process step ${processStep.id} to ${dpp.rfnboType}`);
    return this.processStepService.updateRfnboStatus(processStep, dpp.rfnboType);
  }

  getRfnboForHydrogenRootProduction(rootProduction: RootProductionEntity): RfnboType {
    const redCompliance: RedComplianceEntity = this.redComplianceService.determineRedCompliance(
      [rootProduction.powerProduction],
      [rootProduction.hydrogenProduction],
    );

    const powerType: PowerType = rootProduction.powerProduction.batch.qualityDetails.powerType as PowerType;

    const pos: ProofOfSustainabilityEntity = this.getProofOfSustainability(rootProduction);

    const isEmissionReductionAbove70Percent = pos.emissionReductionPercentage > 70;

    return isEmissionReductionAbove70Percent &&
      redCompliance.isGeoCorrelationValid &&
      redCompliance.isTimeCorrelationValid &&
      redCompliance.isAdditionalityFulfilled &&
      redCompliance.financialSupportReceived &&
      powerType != PowerType.NON_RENEWABLE
      ? RfnboType.RFNBO_READY
      : RfnboType.NON_CERTIFIABLE;
  }

  public getProofOfSustainability(rootProductionEntity: RootProductionEntity): ProofOfSustainabilityEntity {
    const provenance: ProvenanceEntity =
      this.provenanceService.buildProvenanceForHydrogenRootProduction(rootProductionEntity);

    return this.emissionService.createProofOfSustainability(provenance);
  }

  public async readDigitalProductPassport(processStep: ProcessStepEntity): Promise<DigitalProductPassportEntity> {
    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStep);
    const redCompliance: RedComplianceEntity = this.redComplianceService.determineRedCompliance(
      provenance.powerProductions,
      provenance.hydrogenRootProductions,
    );
    const powerType: PowerType = DigitalProductPassportService.getPowerType(provenance.powerProductions);

    //Proof of origin is only for Bottlings
    const proofOfOrigin: ProofOfOriginSectionEntity[] =
      provenance.root.type === ProcessType.HYDROGEN_BOTTLING ||
      provenance.root.type === ProcessType.HYDROGEN_TRANSPORTATION
        ? this.proofOfOriginService.createProofOfOrigin(provenance)
        : [];

    let hydrogenComponentsForBottling: HydrogenComponentEntity[] =
      proofOfOrigin.length > 0 ? this.proofOfOriginService.getHydrogenBottling(proofOfOrigin).hydrogenComposition : [];

    const proofOfSustainability: ProofOfSustainabilityEntity =
      this.emissionService.createProofOfSustainability(provenance);

    return new DigitalProductPassportEntity(
      processStep.id,
      processStep.endedAt,
      processStep.batch.owner.name ?? '',
      processStep.batch.amount ?? 0,
      processStep.batch.qualityDetails.color ?? '',
      processStep.recordedBy.company.name ?? '',
      hydrogenComponentsForBottling,
      processStep.documents ?? [],
      redCompliance,
      proofOfSustainability,
      proofOfOrigin,
      powerType,
    );
  }

  private static getPowerType(powerProductions: ProcessStepEntity[]): PowerType {
    let powerType = PowerType.RENEWABLE;
    const hasRenewableGridPower = powerProductions.some(
      (pp) => pp.batch?.qualityDetails?.powerType == PowerType.PARTLY_RENEWABLE,
    );
    if (hasRenewableGridPower) {
      powerType = PowerType.PARTLY_RENEWABLE;
    }
    const hasNotRenewableGrid = powerProductions.some(
      (pp) => pp.batch?.qualityDetails?.powerType == PowerType.NON_RENEWABLE,
    );
    if (hasNotRenewableGrid) {
      powerType = PowerType.NON_RENEWABLE;
    }
    return powerType;
  }
}
