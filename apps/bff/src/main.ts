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

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const configuration = app.get(ConfigurationService);

  const swaggerConfig = new DocumentBuilder().setTitle('H2 Trust - BFF').setVersion('0.1').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(configuration.getBffConfiguration().swaggerPath, app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new AllErrorsInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useLogger(configuration.getGlobalConfiguration().logLevel);

  await app.listen(configuration.getBffConfiguration().port);
  Logger.log(
    `📡 BFF microservice is up and running via REST: http://localhost:${configuration.getBffConfiguration().port}`,
  );
}

bootstrap();
