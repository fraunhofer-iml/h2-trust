/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProvenanceEntity } from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CalculationTopic } from '@h2-trust/domain';
import { assembleWaterConsumptionEmissionCalculations } from './water-consumption-emission-calculation.assembler';

describe('WaterConsumptionEmissionCalculationAssembler', () => {
  describe('assembleWaterConsumptionEmissionCalculations', () => {
    it('should compute emissions for provenance with hydrogen bottling only when called', () => {
      // arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProvenance = new ProvenanceEntity(givenHydrogenBottling, [givenHydrogenBottling], []);

      // act
      const actualResult = assembleWaterConsumptionEmissionCalculations(givenProvenance)[0];

      // assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.WATER_SUPPLY);
    });
  });
});
