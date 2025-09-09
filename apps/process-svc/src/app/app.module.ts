import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { ProductionModule } from './production/production.module';

@Module({
  imports: [ConfigurationModule, ProductionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
