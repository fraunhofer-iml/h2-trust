/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StagedProductionRepository } from '@h2-trust/database';

@Injectable()
export class StagedProductionCleanupService {
  private readonly logger: Logger = new Logger(StagedProductionCleanupService.name);

  constructor(private readonly repository: StagedProductionRepository) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredAccountingPeriods() {
    try {
      await this.repository.deleteExpiredStagedProductions();
    } catch (error) {
      this.logger.error('Failed to clean old records:', error);
    }
  }
}
