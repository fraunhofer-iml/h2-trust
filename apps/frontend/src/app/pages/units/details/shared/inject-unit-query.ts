/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import { QueryKeyPrefix } from '../../../../shared/queries/shared-query-keys';

export function injectUnitQuery<T>(
  prefix: QueryKeyPrefix,
  id: Signal<string | undefined>,
  fetchFn: (id: string) => Promise<T>,
) {
  return injectQuery(() => ({
    queryKey: [prefix, id()],
    queryFn: () => fetchFn(id() ?? ''),
    onError: (err: HttpErrorResponse) => {
      toast.error(err.name, { description: err.message });
    },
    enabled: !!id(),
  }));
}
