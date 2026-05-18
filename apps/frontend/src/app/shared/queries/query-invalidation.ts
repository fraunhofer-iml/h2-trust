/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient } from '@tanstack/angular-query-experimental';
import { QueryKeyPrefix } from './shared-query-keys';

export async function invalidateByQueryPrefixes(
  queryClient: QueryClient,
  queryKeys: ReadonlyArray<QueryKeyPrefix>,
): Promise<void> {
  await Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })));
}
