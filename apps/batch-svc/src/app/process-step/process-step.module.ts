import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { DatabaseModule } from '@h2-trust/database';
import { StorageModule } from '@h2-trust/storage';
import { BatchSelectionService } from './bottling/batch-selection.service';
import { BottlingService } from './bottling/bottling.service';
import { HydrogenCompositionService } from './bottling/hydrogen-composition.service';
import { ProcessStepAssemblerService } from './bottling/process-step-assembler.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { ConfigurationModule } from '@h2-trust/configuration';

@Module({
  imports: [ConfigurationModule, DatabaseModule, StorageModule, new Broker().getGeneralSvcBroker()],
  controllers: [ProcessStepController],
  providers: [
    ProcessStepService,
    BottlingService,
    HydrogenCompositionService,
    BatchSelectionService,
    ProcessStepAssemblerService,
  ],
})
export class ProcessStepModule { }
