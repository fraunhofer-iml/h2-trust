/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BrokerQueues, RpcExceptionFilter } from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { AppModule } from './app/app.module';

async function bootstrap() {
  Logger.log('🔋 Batch microservice is starting with RMQ...');

  const appContext = await NestFactory.createApplicationContext(AppModule);

  const configuration = appContext.get(ConfigurationService);
  const amqpUri = configuration.getGlobalConfiguration().amqpUri;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [amqpUri],
      queue: BrokerQueues.QUEUE_BATCH_SVC,
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useLogger(configuration.getGlobalConfiguration().logLevel);

  await app
    .listen()
    .then(() =>
      Logger.log(`🔋 Batch microservice is up and running via RMQ: ${amqpUri}:${BrokerQueues.QUEUE_BATCH_SVC}`),
    );
}

bootstrap();
