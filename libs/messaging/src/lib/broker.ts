/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicModule } from '@nestjs/common';
import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';
import { requireEnv } from '@h2-trust/utils';
import { QUEUE_GENERAL_SVC, QUEUE_PROCESS_SVC } from './broker-queues';

export function getGeneralSvcBroker(): DynamicModule {
  return getMessageBroker(QUEUE_GENERAL_SVC);
}

export function getProcessSvcBroker(): DynamicModule {
  return getMessageBroker(QUEUE_PROCESS_SVC);
}

function getMessageBroker(queue: string): DynamicModule {
  return ClientsModule.register([
    {
      name: queue,
      ...getRmqMicroserviceOptions(queue),
    },
  ]);
}

export function getRmqMicroserviceOptions(queue: string): RmqOptions {
  const amqpUri = requireEnv('AMQP_URI');

  return {
    transport: Transport.RMQ,
    options: {
      urls: [amqpUri],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
}

