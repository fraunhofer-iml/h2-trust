/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

export class AmqpClientEnum {
  public static QUEUE_BATCH_SVC = process.env['AMQP_QUEUE_PREFIX'] + 'batch-svc';
  public static QUEUE_GENERAL_SVC = process.env['AMQP_QUEUE_PREFIX'] + 'general-svc';
}
