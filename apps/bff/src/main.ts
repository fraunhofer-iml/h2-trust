/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigurationService } from '@h2-trust/configuration';
import { AllErrorsInterceptor } from './all-errors.interceptor';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppModule } from './app/app.module';

async function bootstrap() {
  Logger.log('📡 BFF microservice is starting with REST API...');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configuration = app.get(ConfigurationService);
  const bffConfiguration = configuration.getBffConfiguration();

  app.useLogger(configuration.getGlobalConfiguration().logLevel);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new AllErrorsInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false, // TODO-MP: set to true after DUHGW-220 is implemented
      forbidNonWhitelisted: false, // TODO-MP: set to true after DUHGW-220 is implemented
    }),
  );
  app.enableCors();
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder().setTitle('H2-Trust - BFF').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(bffConfiguration.swaggerPath, app, document);

  await app.listen(bffConfiguration.port);
  Logger.log(`📡 BFF microservice is up and running via REST: http://localhost:${bffConfiguration.port}`);
}

bootstrap();
