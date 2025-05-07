import { Module } from '@nestjs/common';
import { DatabaseModule } from '@h2-trust/database';
import { StorageModule } from '@h2-trust/storage';
import { BottlingService } from './bottling.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [ProcessStepController],
  providers: [ProcessStepService, BottlingService],
})
export class ProcessStepModule {}
