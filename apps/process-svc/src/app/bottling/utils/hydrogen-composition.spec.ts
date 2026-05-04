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

describe('computeHydrogenComposition', () => {
  it('should calculate hydrogen composition', () => {
    const bottleAmount = 1;
    const components = [new HydrogenComponentEntity(null, 1, RfnboType.RFNBO_READY)];

    const actualResponse = computeHydrogenComposition(components, bottleAmount);
    expect(actualResponse).toEqual(components);
  });

  it('should calculate hydrogen composition with two components', () => {
    const bottleAmount = 1;
    const components = [
      new HydrogenComponentEntity(null, 2, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 3, RfnboType.NOT_SPECIFIED),
    ];

    const expectedResponse = [
      new HydrogenComponentEntity(null, 0.4, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 0.6, RfnboType.NOT_SPECIFIED),
    ];

    const actualResponse = computeHydrogenComposition(components, bottleAmount);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should calculate hydrogen composition with duplicate rfnbo type', () => {
    const bottleAmount = 1;
    const components = [
      new HydrogenComponentEntity(null, 2, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 4, RfnboType.NOT_SPECIFIED),
      new HydrogenComponentEntity(null, 2, RfnboType.RFNBO_READY),
    ];

    const expectedResponse = [
      new HydrogenComponentEntity(null, 0.5, RfnboType.RFNBO_READY),
      new HydrogenComponentEntity(null, 0.5, RfnboType.NOT_SPECIFIED),
    ];

    const actualResponse = computeHydrogenComposition(components, bottleAmount);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should throw an error if totalPredecessorAmount is zero', () => {
    const bottleAmount = 30;
    const components = [new HydrogenComponentEntity(null, 0, RfnboType.RFNBO_READY)];

    expect(() => computeHydrogenComposition(components, bottleAmount)).toThrow(Error);
    expect(() => computeHydrogenComposition(components, bottleAmount)).toThrow(
      'Total stored amount is not greater than 0',
    );
  });
});
