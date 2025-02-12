import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigurationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
