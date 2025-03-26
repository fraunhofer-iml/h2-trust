import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { ProcessStepModule } from './process-step/process-step.module';

@Module({
  imports: [ConfigurationModule, ProcessStepModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
