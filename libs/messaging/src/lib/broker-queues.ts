/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { requireEnv } from "@h2-trust/utils";

export class BrokerQueues {
  private static _QUEUE_GENERAL_SVC = buildQueueName('general-svc');
  private static _QUEUE_PROCESS_SVC = buildQueueName('process-svc');

  public static get QUEUE_GENERAL_SVC(): string {
    return this._QUEUE_GENERAL_SVC;
  }

  public static get QUEUE_PROCESS_SVC(): string {
    return this._QUEUE_PROCESS_SVC;
  }
}

function buildQueueName(suffix: string): string {
  const prefix = requireEnv('AMQP_QUEUE_PREFIX');

  return `${prefix}${suffix}`;
}
