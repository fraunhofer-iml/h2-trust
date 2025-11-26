import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@h2-trust/database';
import { ProductionIntervallCleanupService } from './production-intervall-cleanup.service';

@Module({ imports: [ScheduleModule.forRoot(), DatabaseModule], providers: [ProductionIntervallCleanupService] })
export class ProductionIntervallCleanupModule {}
