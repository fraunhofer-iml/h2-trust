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
import { ProcessType, ProofOfOrigin } from '@h2-trust/domain';
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
    it('should return an empty list when provenance is undefined', () => {
      expect(assembleProofOfOrigin(undefined as never)).toEqual([]);
    });

    it('should assemble sections from the registry and sort them by proof-of-origin order when called', () => {
      // act
      const actualResult = assembleProofOfOrigin({} as never);

      // assert
      expect(actualResult.map((section) => section.name)).toEqual([
        ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION,
        ProofOfOrigin.HYDROGEN_BOTTLING_SECTION,
        ProofOfOrigin.HYDROGEN_TRANSPORTATION_SECTION,
      ]);
    });
  });

  describe('getHydrogenBottlingCompositions', () => {
    it('should return an empty list when proof of origin is missing', () => {
      expect(getHydrogenBottlingCompositions(undefined as never)).toEqual([]);
    });

    it('should return an empty list when no bottling section is present', () => {
      // arrange
      const givenProofOfOrigin = [
        ProofOfOriginSectionEntityFixture.create({ name: ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION }),
      ];

      // act
      const actualResult = getHydrogenBottlingCompositions(givenProofOfOrigin);

      // assert
      expect(actualResult).toEqual([]);
    });

    it('should return the hydrogen composition when the first bottling batch is present', () => {
      // arrange
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

      // act
      const actualResult = getHydrogenBottlingCompositions(givenProofOfOrigin);

      // assert
      expect(actualResult).toEqual(givenHydrogenComposition);
    });
  });
});
