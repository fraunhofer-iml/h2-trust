import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigurationModule, UserModule, UnitModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
