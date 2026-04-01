/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  DigitalProductPassportEntity,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  ProofOfOriginSectionEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
  RedComplianceEntity,
} from '@h2-trust/amqp';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from './proof-of-origin/proof-of-sustainability.service';
import { ProvenanceService } from './provenance/provenance.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly redComplianceService: RedComplianceService,
    private readonly proofOfOriginService: ProofOfOriginService,
    private readonly provenanceService: ProvenanceService,
    private readonly emissionService: ProofOfSustainabilityService,
  ) {}

  public getRfnboType(productionChain: ProductionChainEntity): RfnboType {
    const redCompliance: RedComplianceEntity = this.redComplianceService.determineRedCompliance(
      productionChain.hydrogenRootProduction,
      productionChain.powerProduction,
    );

    const powerType: PowerType = productionChain.powerProduction.batch.qualityDetails.powerType as PowerType;
    const provenance: ProvenanceEntity = ProvenanceEntity.fromProductionChain(productionChain);
    const proofOfSustainability: ProofOfSustainabilityEntity =
      this.emissionService.createProofOfSustainability(provenance);
    return this.determineRfnboType(redCompliance, powerType, proofOfSustainability);
  }

  public async readDigitalProductPassport(processStepId: string): Promise<DigitalProductPassportEntity> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);

    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStep);
    const redCompliance: RedComplianceEntity = this.redComplianceService.determineTotalRedCompliance(
      provenance.productionChains,
    );
    const powerType: PowerType = DigitalProductPassportService.getPowerType(provenance.productionChains);

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

    const rfnboType: RfnboType = this.determineRfnboType(redCompliance, powerType, proofOfSustainability);

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
      rfnboType,
    );
  }

  private static getPowerType(productionChains: ProductionChainEntity[]): PowerType {
    const powerProductions: ProcessStepEntity[] = productionChains.map(
      (productionChain) => productionChain.powerProduction,
    );
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

  private determineRfnboType(
    redCompliance: RedComplianceEntity,
    powerType: PowerType,
    proofOfSustainability: ProofOfSustainabilityEntity,
  ): RfnboType {
    const isEmissionReductionAbove70Percent = proofOfSustainability.emissionReductionPercentage > 70;

    return isEmissionReductionAbove70Percent &&
      redCompliance.isGeoCorrelationValid &&
      redCompliance.isTimeCorrelationValid &&
      redCompliance.isAdditionalityFulfilled &&
      redCompliance.financialSupportReceived &&
      powerType != PowerType.NON_RENEWABLE
      ? RfnboType.RFNBO_READY
      : RfnboType.NON_CERTIFIABLE;
  }
}
