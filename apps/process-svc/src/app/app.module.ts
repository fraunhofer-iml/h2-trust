import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { BottlingModule } from './bottling/bottling.module';
import { ProductionModule } from './production/production.module';

@Module({
  imports: [BottlingModule, ConfigurationModule, ProductionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
