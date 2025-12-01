/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountingPeriodRepository } from '@h2-trust/database';

@Injectable()
export class AccountingPeriodCleanupService {
  private readonly logger: Logger = new Logger(AccountingPeriodCleanupService.name);

  constructor(private readonly accountingPeriodRepo: AccountingPeriodRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredAccountingPeriods() {
    try {
      await this.accountingPeriodRepo.deleteExpiredAccountingPeriods();
    } catch (error) {
      this.logger.error('Failed to clean old records:', error);
    }
  }
}
