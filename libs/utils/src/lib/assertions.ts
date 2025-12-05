/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export function requireDefined<T>(value: T | undefined | null, name: string): NonNullable<T> {
  if (value === undefined || value === null) {
    const message = `Missing ${name}`;
    throw new Error(message);
  }

  return value;
}

export function assertDefined<T>(value: T | null | undefined, name: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    const message = `Missing ${name}`;
    throw new Error(message);
  }
}

export function assertBoolean(value: unknown, name: string): asserts value is boolean {
  assertDefined(value, name);
  if (typeof value !== 'boolean') {
    const message = `${name} must be a boolean: ${value}`;
    throw new Error(message);
  }
}
