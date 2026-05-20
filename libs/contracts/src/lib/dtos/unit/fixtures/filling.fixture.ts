/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FillingDto } from '@h2-trust/contracts/dtos';

export const FillingDtoFixture = {
  create: (overrides: Partial<FillingDto> = {}): FillingDto => ({
    id: overrides.id ?? 'filling-1',
    amount: overrides.amount ?? 10,
  }),
} as const;