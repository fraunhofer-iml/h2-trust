/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionChainEntity, ProvenanceEntity } from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CalculationTopic } from '@h2-trust/domain';
import { assembleProofOfSustainability } from './proof-of-sustainability.assembler';

describe('ProofOfSustainabilityAssembler', () => {
  it('should assemble the proof of sustainability when called', () => {
    // arrange
    const givenPowerProduction = ProcessStepEntityFixture.createPowerProduction();
    const givenWaterConsumption = ProcessStepEntityFixture.createWaterConsumption();
    const givenHydrogenProduction = ProcessStepEntityFixture.createHydrogenProduction();
    const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation();

    const givenProvenance = new ProvenanceEntity(
      givenHydrogenTransportation,
      [givenHydrogenTransportation],
      [
        new ProductionChainEntity(
          givenHydrogenProduction,
          givenHydrogenProduction,
          givenPowerProduction,
          givenWaterConsumption,
          givenPowerProduction.executedBy,
          givenWaterConsumption.executedBy,
        ),
      ],
    );

    // act
    const actualResult = assembleProofOfSustainability(givenProvenance);

    // assert
    expect(actualResult).toBeDefined();
    expect(actualResult.batchId).toBe(givenHydrogenTransportation.id);
    expect(actualResult.calculations.length).toBe(7);
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
    expect(
      actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_COMPRESSION).length,
    ).toBe(1);
    expect(
      actualResult.calculations.filter((c) => c.calculationTopic === CalculationTopic.HYDROGEN_END_USE).length,
    ).toBe(1);
    expect(actualResult.emissions.length).toBe(10);
    expect(actualResult.emissions.filter((e) => e.emissionType === 'APPLICATION').length).toBe(7);
    expect(actualResult.emissions.filter((e) => e.emissionType === 'REGULATORY').length).toBe(3);
  });
});
