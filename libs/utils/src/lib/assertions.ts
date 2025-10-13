/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export function requireDefined<T>(value: T | undefined | null, name: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}
