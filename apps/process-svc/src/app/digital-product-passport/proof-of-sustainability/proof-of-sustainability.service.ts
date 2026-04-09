/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import {
  ProofOfSustainabilityEmissionCalculationEntity,
  ProofOfSustainabilityEmissionEntity,
  ProofOfSustainabilityEntity,
  ProvenanceEntity,
} from '@h2-trust/amqp';
import { EmissionNumericConstants, EmissionStringConstants } from '@h2-trust/domain';
import { proofOfSustainabilityAssemblers } from './proof-of-origin-assembler.registry.const';

@Injectable()
export class ProofOfSustainabilityService {
  /**
   * Calculates the emissions figures for the individual process steps in a production chain based on a provenance. It then compiles the results into a Proof of Sustainability.
   * @param provenance The provenance, which covers the entire production chain.
   * @returns The generated ProofOfSustainability.
   */
  public createProofOfSustainability(provenance: ProvenanceEntity): ProofOfSustainabilityEntity {
    if (!provenance) {
      throw new Error('Provenance is undefined.');
    }

    const emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[] =
      proofOfSustainabilityAssemblers.flatMap((posAssembler) => posAssembler.assembleEmissions(provenance));
    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    return this.assembleProofOfSustainability(provenance.root.id, emissionCalculations, hydrogenAmount);
  }

  private assembleProofOfSustainability(
    batchId: string,
    emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
    hydrogenAmountKg: number,
  ): ProofOfSustainabilityEntity {
    const applicationEmissions: ProofOfSustainabilityEmissionEntity[] =
      this.assembleApplicationEmissions(emissionCalculations);

    const hydrogenProductionEmissionAmount: number = applicationEmissions
      .filter((e) => e.name === EmissionStringConstants.TYPES.EPS || e.name === EmissionStringConstants.TYPES.EWS)
      .reduce((sum, e) => sum + e.amount, 0);

    const applicationEmissionAmount: number = applicationEmissions.reduce((acc, emission) => acc + emission.amount, 0);
    const hydrogenTransportEmissionAmount: number =
      applicationEmissions.find((e) => e.name === EmissionStringConstants.TYPES.EHT)?.amount ?? 0;
    const regulatoryEmissions: ProofOfSustainabilityEmissionEntity[] = this.assembleRegulatoryEmissions(
      hydrogenProductionEmissionAmount,
      applicationEmissionAmount,
      hydrogenTransportEmissionAmount,
    );
    const emissions: ProofOfSustainabilityEmissionEntity[] = [...applicationEmissions, ...regulatoryEmissions];

    const totalEmissions: number = applicationEmissionAmount;
    const amountCO2PerKgH2: number = applicationEmissionAmount / hydrogenAmountKg;
    const amountCO2PerMJH2: number = amountCO2PerKgH2 / EmissionNumericConstants.H2_LOWER_HEATING_VALUE_MJ_PER_KG;

    const emissionReductionPercentage: number =
      (Math.max(EmissionNumericConstants.FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ - amountCO2PerMJH2, 0) /
        EmissionNumericConstants.FOSSIL_FUEL_COMPARATOR_G_CO2_PER_MJ) *
      100;

    return new ProofOfSustainabilityEntity(
      batchId,
      totalEmissions,
      amountCO2PerKgH2,
      amountCO2PerMJH2,
      emissionReductionPercentage,
      emissionCalculations,
      emissions,
    );
  }

  private assembleApplicationEmissions(
    emissionCalculations: ProofOfSustainabilityEmissionCalculationEntity[],
  ): ProofOfSustainabilityEmissionEntity[] {
    return proofOfSustainabilityAssemblers.flatMap((posAssembler) =>
      posAssembler.calculateEmission(emissionCalculations),
    );
  }

  private assembleRegulatoryEmissions(
    hydrogenProductionEmissionAmount: number,
    applicationEmissionAmount: number,
    hydrogenTransportEmissionAmount: number,
  ): ProofOfSustainabilityEmissionEntity[] {
    const ei = new ProofOfSustainabilityEmissionEntity(
      hydrogenProductionEmissionAmount,
      EmissionStringConstants.TYPES.EI,
      EmissionStringConstants.SUPPLY_OF_INPUTS,
      EmissionStringConstants.TYPES.REGULATORY,
    );

    const ep = new ProofOfSustainabilityEmissionEntity(
      applicationEmissionAmount - hydrogenProductionEmissionAmount - hydrogenTransportEmissionAmount,
      EmissionStringConstants.TYPES.EP,
      EmissionStringConstants.PROCESSING,
      EmissionStringConstants.TYPES.REGULATORY,
    );

    const etd = new ProofOfSustainabilityEmissionEntity(
      hydrogenTransportEmissionAmount,
      EmissionStringConstants.TYPES.ETD,
      EmissionStringConstants.TRANSPORT_AND_DISTRIBUTION,
      EmissionStringConstants.TYPES.REGULATORY,
    );

    return [ei, ep, etd];
  }
}
