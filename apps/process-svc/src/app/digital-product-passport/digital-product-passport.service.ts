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
} from '@h2-trust/contracts/entities';
import { PowerType, RfnboType } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';
import { createProofOfOrigin, getHydrogenBottlingCompositions } from './proof-of-origin/proof-of-origin.service';
import { createProofOfSustainability } from './proof-of-sustainability/proof-of-sustainability.service';
import { ProvenanceService } from './provenance/provenance.service';
import { determineRedCompliance, determineTotalRedCompliance } from './red-compliance/red-compliance.service';

@Injectable()
export class DigitalProductPassportService {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly provenanceService: ProvenanceService,
  ) {}

  /**
   * Calculates the RFNBO type for an existing production chain.
   * @param productionChain The production chain element to be checked against the RFNBO type.
   * @returns The calculated RFNBO type.
   */
  public getRfnboType(productionChain: ProductionChainEntity): RfnboType {
    const redCompliance: RedComplianceEntity = determineRedCompliance(
      productionChain.hydrogenRootProduction,
      productionChain.powerProduction,
    );

    const powerType: PowerType = productionChain.powerProduction.batch.qualityDetails.powerType as PowerType;
    const provenance: ProvenanceEntity = ProvenanceEntity.fromProductionChain(productionChain);
    const proofOfSustainability: ProofOfSustainabilityEntity = createProofOfSustainability(provenance);
    return this.determineRfnboType(redCompliance, powerType, proofOfSustainability);
  }

  /**
   * Calculates all the dpp metrics for a process step, namely the RFNBO type, the ProofOfOrigin and the ProofOfSustainability.
   * @param processStepId The ID of the process step for which the DPP is to be calculated.
   * @returns The calculated dpp.
   */
  public async readDigitalProductPassport(processStepId: string): Promise<DigitalProductPassportEntity> {
    const processStep: ProcessStepEntity = await this.processStepService.readProcessStep(processStepId);

    const provenance: ProvenanceEntity = await this.provenanceService.buildProvenance(processStep);
    const redCompliance: RedComplianceEntity = determineTotalRedCompliance(provenance.productionChains);

    const proofOfOrigin: ProofOfOriginSectionEntity[] = createProofOfOrigin(provenance);

    const hydrogenComponentsForBottling: HydrogenComponentEntity[] = getHydrogenBottlingCompositions(proofOfOrigin);

    const proofOfSustainability: ProofOfSustainabilityEntity = createProofOfSustainability(provenance);

    const powerType: PowerType = this.determinePowerType(provenance.productionChains);
    const rfnboType: RfnboType = this.determineRfnboType(redCompliance, powerType, proofOfSustainability);

    return new DigitalProductPassportEntity(
      processStep.id,
      processStep.endedAt,
      processStep.batch.owner.name ?? '',
      processStep.batch.amount ?? 0,
      processStep.batch.qualityDetails.color,
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

  private determinePowerType(productionChains: ProductionChainEntity[]): PowerType {
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
