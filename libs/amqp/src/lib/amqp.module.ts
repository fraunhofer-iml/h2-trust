/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { Broker } from './broker/broker';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [Broker],
})
export class AmqpModule {}
