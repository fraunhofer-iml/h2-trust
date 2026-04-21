/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { requireEnv } from '@h2-trust/utils';
import { BrokerQueues } from './broker-queues';

export class Broker {
  public static getGeneralSvcBroker(): DynamicModule {
    return Broker.getMessageBroker(BrokerQueues.QUEUE_GENERAL_SVC);
  }

  public static getProcessSvcBroker(): DynamicModule {
    return Broker.getMessageBroker(BrokerQueues.QUEUE_PROCESS_SVC);
  }

  private static getMessageBroker(queue: string): DynamicModule {
    const amqpUri = requireEnv('AMQP_URI');

    return ClientsModule.register([
      {
        name: queue,
        transport: Transport.RMQ,
        options: {
          urls: [amqpUri],
          queue,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]);
  }
}
