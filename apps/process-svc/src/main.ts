/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigurationService } from '@h2-trust/configuration';
import { getRmqMicroserviceOptions, QUEUE_PROCESS_SVC, RpcExceptionFilter } from '@h2-trust/messaging';
import { requireEnv } from '@h2-trust/utils';
import { AppModule } from './app/app.module';

async function bootstrap() {
  Logger.log('⚖️ Process microservice is starting with RMQ...');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    bufferLogs: true,
    ...getRmqMicroserviceOptions(QUEUE_PROCESS_SVC),
  });

  app.useLogger(app.get(ConfigurationService).getGlobalConfiguration().logLevel);
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  await app.listen();
  Logger.log(`⚖️ Process microservice is up and running via RMQ: ${requireEnv('AMQP_URI')}:${QUEUE_PROCESS_SVC}`);
}

bootstrap();
