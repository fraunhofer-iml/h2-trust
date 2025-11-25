/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BrokerException } from '@h2-trust/amqp';

export function assertDefined<T>(value: T | null | undefined, fieldName: string): asserts value is T {
  if (value == null) {
    throw new BrokerException(`${fieldName} was undefined`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
