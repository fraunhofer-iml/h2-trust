/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export abstract class BaseChipComponent {
  protected readonly defaultChipColor = 'text-neutral-600 bg-neutral-600/20 border-neutral-600/10 rounded-md';
  protected readonly defaultDotColor = 'bg-neutral-600';

  abstract readonly chipColor: string | undefined;
  abstract readonly dotColor: string | undefined;
  abstract readonly label: string;

  get resolvedChipClasses(): string {
    return this.chipColor ?? this.defaultChipColor;
  }
  get resolvedDotClasses(): string {
    return this.dotColor ?? this.defaultDotColor;
  }
}
