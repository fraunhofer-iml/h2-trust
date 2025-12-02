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

export function toValidDate(value: unknown, name: string): Date {
  assertDefined(value, name);
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    const message = `${name} must be a string, number or Date: ${value}`;
    throw new Error(message);
  }
  if (Number.isNaN(date.getTime())) {
    const message = `${name} is not a valid date: ${value}`;
    throw new Error(message);
  }
  return date;
}
