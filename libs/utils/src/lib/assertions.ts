/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidationException } from '@h2-trust/exceptions';

export function assertDefined<T>(value: T | undefined | null, name: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new ValidationException(`Missing ${name}`);
  }
}

export function assertBoolean(value: unknown, name: string): asserts value is boolean {
  assertDefined(value, name);

  if (typeof value !== 'boolean') {
    throw new ValidationException(`${name} must be a boolean: ${value}`);
  }
}

export function assertValidEnum<E extends Record<string, string>>(
  value: unknown,
  enumType: E,
  enumName: string,
): asserts value is E[keyof E] {
  if (!Object.values(enumType).includes(value as E[keyof E])) {
    throw new ValidationException(`The value ${value} is not a valid ${enumName}`);
  }
}

export function assertValidTimeZone(value: unknown, name = 'timezone'): asserts value is string {
  if (value === undefined || value === null || value === '') {
    throw new ValidationException(`Missing ${name}`);
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: value as string });
  } catch {
    throw new ValidationException(`${value} must be a valid timezone.`);
  }
}
