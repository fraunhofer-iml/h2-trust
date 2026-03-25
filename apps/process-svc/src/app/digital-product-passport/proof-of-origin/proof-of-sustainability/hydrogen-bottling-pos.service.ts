/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity, ProofOfSustainabilityEmissionCalculationEntity, ProvenanceEntity } from '@h2-trust/amqp';
import { CalculationTopic, EmissionStringConstants, MeasurementUnit, ProcessType } from '@h2-trust/domain';

export class HydrogenBottlingPosService {
  public static computeProvenanceEmissionsForHydrogenBottling(
    provenance: ProvenanceEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (!provenance || !provenance.hydrogenBottling) {
      throw new Error('Provenance or hydrogen bottling is undefined.');
    }

    const hydrogenAmount = provenance.hydrogenBottling
      ? provenance.hydrogenBottling.batch.amount
      : provenance.root.batch.amount;

    const hydrogenBottling: ProofOfSustainabilityEmissionCalculationEntity = this.assembleHydrogenBottling(
      provenance.hydrogenBottling,
    );

    const totalEmissions = hydrogenBottling.result;
    const totalEmissionsGrouped = [`${totalEmissions} ${MeasurementUnit.G_CO2}`];
    const totalEmissionsPerKgHydrogen = totalEmissions / hydrogenAmount;

    return new ProofOfSustainabilityEmissionCalculationEntity(
      totalEmissions.toString(),
      totalEmissionsGrouped,
      totalEmissionsPerKgHydrogen,
      MeasurementUnit.G_CO2_PER_KG_H2,
      CalculationTopic.HYDROGEN_BOTTLING,
    );
  }

  static assembleHydrogenBottling(
    _hydrogenBottling: ProcessStepEntity,
  ): ProofOfSustainabilityEmissionCalculationEntity {
    if (_hydrogenBottling?.type !== ProcessType.HYDROGEN_BOTTLING) {
      throw new Error(
        `Invalid process step type [${_hydrogenBottling?.type}] for hydrogen bottling emission calculation`,
      );
    }

    const result = 0;

    const basisOfCalculation = ['E = [TBD]'];

    return new ProofOfSustainabilityEmissionCalculationEntity(
      EmissionStringConstants.HYDROGEN_BOTTLING,
      basisOfCalculation,
      result,
      MeasurementUnit.G_CO2,
      CalculationTopic.HYDROGEN_BOTTLING,
    );
  }
}
