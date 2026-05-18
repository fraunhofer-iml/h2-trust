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

  function mockArgs(object: any): ValidationArguments {
    return {
      object,
      value: undefined,
      constraints: [],
      property: 'validTo',
      targetName: 'TestClass',
    };
  }

  it('should return true when validFrom is before validTo', () => {
    const validFrom = new Date('2024-01-01');
    const validTo = new Date('2024-02-01');

    const args = mockArgs({ validFrom });

    const result = constraint.validate(validTo, args);

    expect(result).toBe(true);
  });

  it('should return false when validFrom is after validTo', () => {
    const validFrom = new Date('2024-03-01');
    const validTo = new Date('2024-02-01');

    const args = mockArgs({ validFrom });

    const result = constraint.validate(validTo, args);

    expect(result).toBe(false);
  });

  it('should return false when validFrom is equal to validTo', () => {
    const date = new Date('2024-01-01');

    const args = mockArgs({ validFrom: date });

    const result = constraint.validate(date, args);

    expect(result).toBe(false);
  });

  it('should return false when validFrom is missing', () => {
    const validTo = new Date('2024-02-01');

    const args = mockArgs({});

    const result = constraint.validate(validTo, args);

    expect(result).toBe(false);
  });

  it('should return the default error message', () => {
    expect(constraint.defaultMessage()).toBe('validFrom needs to be before validTo');
  });
});
