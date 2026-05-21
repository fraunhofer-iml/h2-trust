/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenComponentEntity } from '@h2-trust/contracts/entities';
import { RfnboType } from '@h2-trust/domain';
import { computeHydrogenComposition } from './hydrogen-composition';

const STORAGE_UNIT_ID = 'test-storage-unit';

describe('computeHydrogenComposition', () => {
  it('should calculate hydrogen composition when called', () => {
  // arrange
    const givenBottleAmount = 1;
    const givenComponents = [new HydrogenComponentEntity(null, 1, RfnboType.RFNBO_READY)];

    // act
    const actualResponse = computeHydrogenComposition(givenComponents, givenBottleAmount, STORAGE_UNIT_ID);

    // assert
    expect(actualResponse).toEqual(givenComponents);
  });

  it('should calculate hydrogen composition with two components when called', () => {
  // arrange
    const givenBottleAmount = 1;
    const givenComponents = [
      new HydrogenComponentEntity(null, 2, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 3, RfnboType.NOT_SPECIFIED),
    ];

    const expectedResponse = [
      new HydrogenComponentEntity(null, 0.4, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 0.6, RfnboType.NOT_SPECIFIED),
    ];

    // act
    const actualResponse = computeHydrogenComposition(givenComponents, givenBottleAmount, STORAGE_UNIT_ID);

    // assert
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should calculate hydrogen composition with duplicate rfnbo type when called', () => {
  // arrange
    const givenBottleAmount = 1;
    const givenComponents = [
      new HydrogenComponentEntity(null, 2, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 4, RfnboType.NOT_SPECIFIED),
      new HydrogenComponentEntity(null, 2, RfnboType.RFNBO_READY),
    ];

    const expectedResponse = [
      new HydrogenComponentEntity(null, 0.5, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 0.5, RfnboType.NOT_SPECIFIED),
    ];

    // act
    const actualResponse = computeHydrogenComposition(givenComponents, givenBottleAmount, STORAGE_UNIT_ID);

    // assert
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should throw when total stored amount is zero', () => {
  // arrange
    const givenBottleAmount = 30;
    const givenComponents = [new HydrogenComponentEntity(null, 0, RfnboType.RFNBO_READY)];

    // act & assert
    const actualOperation = () => computeHydrogenComposition(givenComponents, givenBottleAmount, STORAGE_UNIT_ID);

    expect(actualOperation).toThrow(
      `Total stored amount of storage unit '${STORAGE_UNIT_ID}' is not greater than 0`,
    );
  });
});
