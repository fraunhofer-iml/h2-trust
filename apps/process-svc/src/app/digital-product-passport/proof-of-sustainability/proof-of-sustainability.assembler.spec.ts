/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProductionChainEntity,
  ProvenanceEntity,
} from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture, TransportationDetailsEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CalculationTopic } from '@h2-trust/domain';
import { assembleProofOfSustainability } from './proof-of-sustainability.assembler';

describe('ProofOfSustainabilityAssembler', () => {
  it('assembleProofOfSustainability', () => {
    // Arrange
    const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction();
    const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption();
    const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
    const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
    const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({
      transportationDetails: TransportationDetailsEntityFixture.createTrailer(),
    });
    const givenProvenance = new ProvenanceEntity(
      givenHydrogenTransportation,
      [
        new ProductionChainEntity(
          givenHydrogenProduction,
          givenHydrogenProduction,
          givenPowerProduction,
          givenWaterConsumption,
          givenPowerProduction.executedBy as PowerProductionUnitEntity,
          givenWaterConsumption.executedBy as HydrogenProductionUnitEntity,
        ),
      ],
      givenHydrogenBottling,
    );

    // Act
    const actualResult = assembleProofOfSustainability(givenProvenance);

    // Assert
    expect(actualResult).toBeDefined();
    expect(actualResult.batchId).toBe(givenHydrogenTransportation.id);
    expect(actualResult.calculations.length).toBe(5);
    expect(actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.POWER_SUPPLY).length).toBe(
      1,
    );
    expect(actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.WATER_SUPPLY).length).toBe(
      1,
    );
    expect(
      actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_STORAGE).length,
    ).toBe(1);
    expect(
      actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_BOTTLING).length,
    ).toBe(1);
    expect(
      actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_TRANSPORTATION).length,
    ).toBe(1);
    expect(actualResult.emissions.length).toBe(8);
    expect(actualResult.emissions.filter((e) => e.emissionType === 'APPLICATION').length).toBe(5);
    expect(actualResult.emissions.filter((e) => e.emissionType === 'REGULATORY').length).toBe(3);
  });
});
