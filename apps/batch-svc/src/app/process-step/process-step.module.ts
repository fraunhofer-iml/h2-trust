import { Module } from '@nestjs/common';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { PrismaService } from '@h2-trust/database';

@Module({
  controllers: [ProcessStepController],
  providers: [ProcessStepService, PrismaService]
})
export class ProcessStepModule {}
