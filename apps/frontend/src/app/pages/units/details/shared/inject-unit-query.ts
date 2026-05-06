/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ERROR_MESSAGES } from '../../../../shared/constants/error.messages';
import { QueryKeyPrefix } from '../../../../shared/queries/shared-query-keys';

export function injectUnitQuery<T>(
  prefix: QueryKeyPrefix,
  id: Signal<string | undefined>,
  fetchFn: (id: string) => Promise<T>,
) {
  return injectQuery(() => ({
    queryKey: [prefix, id()],
    queryFn: async () => {
      try {
        return await fetchFn(id() ?? '');
      } catch (err: any) {
        throw new Error(err.status === 404 ? ERROR_MESSAGES.unitNotFound + id() : ERROR_MESSAGES.unknownError, {
          cause: err,
        });
      }
    },
    enabled: !!id(),
  }));
}
