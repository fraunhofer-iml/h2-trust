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
  Logger.log('🧰 General microservice is starting with RMQ...');

  const amqpUri = process.env['AMQP_URI'];

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    bufferLogs: true,
    transport: Transport.RMQ,
    options: {
      urls: [amqpUri],
      queue: BrokerQueues.QUEUE_GENERAL_SVC,
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useLogger(app.get(ConfigurationService).getGlobalConfiguration().logLevel);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new RpcExceptionFilter());

  await app.listen();
  Logger.log(`🧰 General microservice is up and running via RMQ: ${amqpUri}:${BrokerQueues.QUEUE_GENERAL_SVC}`);
}

bootstrap();
