/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Signal } from '@angular/core';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { UnitType } from '@h2-trust/domain';
import { ERROR_MESSAGES } from '../../../../shared/constants/error.messages';

export function injectUnitQuery<T>(
  unitType: UnitType,
  id: Signal<string | undefined>,
  fetchFn: (id: string) => Promise<T>,
) {
  return injectQuery(() => ({
    queryKey: [unitType, id()],
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

export function useQueryInvalidation(queryClient: QueryClient, unitType: UnitType, id: Signal<string | undefined>) {
  return () => queryClient.invalidateQueries({ queryKey: [unitType, id()] });
}
