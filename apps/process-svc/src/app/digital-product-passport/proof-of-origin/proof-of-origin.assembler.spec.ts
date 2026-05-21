/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HydrogenComponentEntityFixture,
  ProofOfOriginHydrogenBatchEntityFixture,
  ProofOfOriginSectionEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import { ProofOfOrigin, ProcessType } from '@h2-trust/domain';
import { assembleProofOfOrigin, getHydrogenBottlingCompositions } from './proof-of-origin.assembler';

jest.mock('./proof-of-origin-assembler.registry.const', () => ({
  proofOfOriginSectionAssemblers: [
    {
      assembleSection: jest.fn(() => [
        ProofOfOriginSectionEntityFixture.create({ name: ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION }),
      ]),
    },
    {
      assembleSection: jest.fn(() => [
        ProofOfOriginSectionEntityFixture.create({ name: ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION }),
      ]),
    },
    {
      assembleSection: jest.fn(() => [
        ProofOfOriginSectionEntityFixture.create({ name: ProofOfOrigin.HYDROGEN_BOTTLING_SECTION }),
      ]),
    },
  ],
}));

describe('ProofOfOriginAssembler', () => {
  describe('assembleProofOfOrigin', () => {
    it('returns an empty list for undefined provenance', () => {
      expect(assembleProofOfOrigin(undefined as never)).toEqual([]);
    });

    it('assembles sections from the registry and sorts them by proof-of-origin order', () => {
      // Act
      const actualResult = assembleProofOfOrigin({} as never);

      // Assert
      expect(actualResult.map((section) => section.name)).toEqual([
        ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION,
        ProofOfOrigin.HYDROGEN_BOTTLING_SECTION,
        ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION,
      ]);
    });
  });

  describe('getHydrogenBottlingCompositions', () => {
    it('returns an empty list when proof of origin is missing', () => {
      expect(getHydrogenBottlingCompositions(undefined as never)).toEqual([]);
    });

    it('returns an empty list when no bottling section is present', () => {
      // Arrange
      const givenProofOfOrigin = [
        ProofOfOriginSectionEntityFixture.create({ name: ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION }),
      ];

      // Act & Assert
      expect(getHydrogenBottlingCompositions(givenProofOfOrigin)).toEqual([]);
    });

    it('returns the hydrogen composition from the first bottling batch', () => {
      // Arrange
      const givenHydrogenComposition = [
        HydrogenComponentEntityFixture.createRfnboReady({ amount: 60 }),
        HydrogenComponentEntityFixture.createNonCertifiable({ amount: 40 }),
      ];
      const givenProofOfOrigin = [
        ProofOfOriginSectionEntityFixture.create({
          name: ProofOfOrigin.HYDROGEN_BOTTLING_SECTION,
          batches: [
            ProofOfOriginHydrogenBatchEntityFixture.create({
              processStep: ProcessType.HYDROGEN_BOTTLING,
              hydrogenComposition: givenHydrogenComposition,
            }),
          ],
        }),
      ];

      // Act
      const actualResult = getHydrogenBottlingCompositions(givenProofOfOrigin);

      // Assert
      expect(actualResult).toEqual(givenHydrogenComposition);
    });
  });
});