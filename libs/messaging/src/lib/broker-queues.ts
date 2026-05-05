/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { requireEnv } from '@h2-trust/utils';

export const QUEUE_GENERAL_SVC = buildQueueName('general-svc');
export const QUEUE_PROCESS_SVC = buildQueueName('process-svc');

function buildQueueName(suffix: string): string {
  const prefix = requireEnv('AMQP_QUEUE_PREFIX');

  return `${prefix}${suffix}`;
}
