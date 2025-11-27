/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductionIntervallRepository } from '@h2-trust/database';

@Injectable()
export class ProductionIntervallCleanupService {
  private readonly logger: Logger = new Logger(ProductionIntervallCleanupService.name);

  constructor(private readonly intervallRepo: ProductionIntervallRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldProductionIntervalls() {
    try {
      await this.intervallRepo.deleteOldIntervalls();
    } catch (error) {
      this.logger.error('Failed to clean old records:', error);
    }
  }
}
