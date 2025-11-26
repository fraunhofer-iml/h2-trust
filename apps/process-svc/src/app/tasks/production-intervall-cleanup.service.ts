import { TempAccountingPeriodRepository } from 'libs/database/src/lib/repositories/temp-accounting-period.repository';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductionIntervallCleanupService {
  private readonly logger: Logger = new Logger(ProductionIntervallCleanupService.name);

  constructor(private readonly intervallRepo: TempAccountingPeriodRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldProductionIntervalls() {
    try {
      await this.intervallRepo.deleteOldIntervalls();
    } catch (error) {
      this.logger.error('Failed to clean old records:', error);
    }
  }
}
