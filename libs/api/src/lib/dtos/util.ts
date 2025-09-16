/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export function parseColor(quality: string | undefined): string | undefined {
  if (!quality) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(quality);
    return parsed.color;
  } catch {
    return undefined;
  }
}
