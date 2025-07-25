import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';
import { PowerAccessApprovalModule } from './power-access-approval/power-access-approval.module';

@Module({
  imports: [ConfigurationModule, UserModule, UnitModule, PowerAccessApprovalModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
