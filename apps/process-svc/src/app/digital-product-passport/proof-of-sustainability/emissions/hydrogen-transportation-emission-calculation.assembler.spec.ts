/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProvenanceEntity,
  TransportationDetailsEntity,
} from '@h2-trust/contracts/entities';
import { ProcessStepEntityFixture, TransportationDetailsEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CalculationTopic } from '@h2-trust/domain';
import { assembleHydrogenTransportationEmissionCalculations } from './hydrogen-transportation-emission-calculation.assembler';

describe('ProofOfSustainability', () => {
  describe('assembleHydrogenTransportationEmissionCalculations', () => {
    it('computes emissions for provenance with hydrogen bottling only', () => {
      // Arrange
      const givenHydrogenBottling = ProcessStepEntityFixture.createHydrogenBottling();
      const transportationDetails: TransportationDetailsEntity = TransportationDetailsEntityFixture.createPipeline();
      const givenHydrogenTransportation = ProcessStepEntityFixture.createHydrogenTransportation({ transportationDetails });
      const givenProvenance = new ProvenanceEntity(givenHydrogenTransportation, [], givenHydrogenBottling);

      // Act
      const actualResult = assembleHydrogenTransportationEmissionCalculations(givenProvenance)[0];

      // Assert
      expect(actualResult).toBeDefined();
      expect(actualResult.result).toBe(0); // TODO-MP: batchId or processStepId -> DUHGW-314
      expect(actualResult.calculationTopic).toEqual(CalculationTopic.HYDROGEN_TRANSPORTATION);
    });
  });
});
