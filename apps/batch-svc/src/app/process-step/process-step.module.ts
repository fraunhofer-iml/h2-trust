import { Module } from '@nestjs/common';
import { DatabaseModule } from '@h2-trust/database';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProcessStepController],
  providers: [ProcessStepService],
})
export class ProcessStepModule {}
