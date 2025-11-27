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
