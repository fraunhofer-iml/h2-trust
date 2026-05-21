/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidationArguments } from 'class-validator';
import { IsBeforeConstraint } from './is-before.validator';

describe('IsBeforeConstraint', () => {
  let constraint: IsBeforeConstraint;

  beforeEach(() => {
    constraint = new IsBeforeConstraint();
  });

  function mockArgs(object: Record<string, unknown>): ValidationArguments {
    return {
      object,
      value: undefined,
      constraints: [],
      property: 'validTo',
      targetName: 'TestClass',
    };
  }

  it('should return true when validFrom is before validTo', () => {
    // arrange
    const givenValidFrom = new Date('2024-01-01');
    const givenValidTo = new Date('2024-02-01');

    const givenArgs = mockArgs({ validFrom: givenValidFrom });

    // act
    const actualResult = constraint.validate(givenValidTo, givenArgs);

    // assert
    expect(actualResult).toBe(true);
  });

  it('should return false when validFrom is after validTo', () => {
    // arrange
    const givenValidFrom = new Date('2024-03-01');
    const givenValidTo = new Date('2024-02-01');

    const givenArgs = mockArgs({ validFrom: givenValidFrom });

    // act
    const actualResult = constraint.validate(givenValidTo, givenArgs);

    // assert
    expect(actualResult).toBe(false);
  });

  it('should return false when validFrom is equal to validTo', () => {
    // arrange
    const givenDate = new Date('2024-01-01');

    const givenArgs = mockArgs({ validFrom: givenDate });

    // act
    const actualResult = constraint.validate(givenDate, givenArgs);

    // assert
    expect(actualResult).toBe(false);
  });

  it('should return false when validFrom is missing', () => {
    // arrange
    const givenValidTo = new Date('2024-02-01');

    const givenArgs = mockArgs({});

    // act
    const actualResult = constraint.validate(givenValidTo, givenArgs);

    // assert
    expect(actualResult).toBe(false);
  });

  it('should return the default error message when no custom message is provided', () => {
    // act
    const actualResult = constraint.defaultMessage();

    // assert
    expect(actualResult).toBe('validFrom needs to be before validTo');
  });
});
